import React, { useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

/**
 * ZoomableSvg — wraps any child (e.g. <Svg>) with pinch-to-zoom, pan-to-scroll,
 * and double-tap-to-zoom. Uses react-native-gesture-handler + reanimated so the
 * gestures run on the UI thread and feel native.
 *
 * Props:
 *   - children:           the content to zoom (rendered as a single transformable layer)
 *   - minScale / maxScale: zoom limits (default 1, 5)
 *   - doubleTapZoom:      scale factor applied on double-tap (default 2.5)
 *   - onTap:              (x, y) => void — receives the SVG-space coordinates of a tap
 *                         that wasn't part of a pan/pinch (so taps on states still
 *                         work through `onPressIn` on the SVG paths).
 *   - style:              wrapper style
 *   - resetSignal:        any value; when it changes the view resets to identity.
 *
 * Pan/pinch math (clamping): see CLAMP_*. When the user zooms in we recompute
 * the translation bounds from the current scale and the container size.
 */
const CLAMP_MIN = 0.6; // allow a slight "shrink" so panning after pinch doesn't yank
const CLAMP_MAX = 5;

const ZoomableSvg = forwardRef(function ZoomableSvg({
  children,
  minScale = 1,
  maxScale = 5,
  doubleTapZoom = 2.5,
  onTap,
  style,
  resetSignal,
}, ref) {
  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);   // scale at the start of an active gesture
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const baseTx = useSharedValue(0);
  const baseTy = useSharedValue(0);

  // Container size in pixels (used for clamping panning).
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const reset = useCallback(() => {
    scale.value = withTiming(1, { duration: 220 });
    tx.value = withTiming(0, { duration: 220 });
    ty.value = withTiming(0, { duration: 220 });
  }, [scale, tx, ty]);

  // External reset (e.g. when user changes state/level).
  React.useEffect(() => { reset(); }, [resetSignal, reset]);

  // Imperative handle: zoom by a factor, zoom to a target scale (centred on
  // the container), or reset. The screen's button cluster calls these.
  const animateTo = (targetScale, anchorX = 0, anchorY = 0) => {
    const s = Math.max(minScale, Math.min(maxScale, targetScale));
    scale.value = withSpring(s, { damping: 18, stiffness: 180 });
    const cx = size.width / 2;
    const cy = size.height / 2;
    const fx = anchorX - cx;
    const fy = anchorY - cy;
    const next = {
      x: Math.min(Math.max(-fx * (s - 1), -(size.width * (s - 1)) / 2), (size.width * (s - 1)) / 2),
      y: Math.min(Math.max(-fy * (s - 1), -(size.height * (s - 1)) / 2), (size.height * (s - 1)) / 2),
    };
    tx.value = withSpring(next.x, { damping: 18, stiffness: 180 });
    ty.value = withSpring(next.y, { damping: 18, stiffness: 180 });
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => animateTo(scale.value * 1.5),
    zoomOut: () => animateTo(scale.value / 1.5),
    reset,
  }), [reset, size.width, size.height, scale, tx, ty]);

  const clampPan = (s, x, y) => {
    'worklet';
    const w = size.width, h = size.height;
    if (!w || !h) return { x, y };
    // Maximum translation so the content edges don't go past the container.
    const maxX = Math.max(0, (w * (s - 1)) / 2);
    const maxY = Math.max(0, (h * (s - 1)) / 2);
    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    };
  };

  const pinch = useMemo(
    () => Gesture.Pinch()
      .onStart(() => {
        baseScale.value = scale.value;
        baseTx.value = tx.value;
        baseTy.value = ty.value;
      })
      .onUpdate((e) => {
        const next = Math.max(minScale * CLAMP_MIN, Math.min(maxScale, baseScale.value * e.scale));
        scale.value = next;
        const clamped = clampPan(next, baseTx.value, baseTy.value);
        tx.value = clamped.x;
        ty.value = clamped.y;
      }),
    [size.width, size.height],
  );

  const pan = useMemo(
    () => Gesture.Pan()
      .averageTouches(true)
      .onStart(() => {
        baseTx.value = tx.value;
        baseTy.value = ty.value;
        baseScale.value = scale.value;
      })
      .onUpdate((e) => {
        const next = baseScale.value; // pan only — don't change scale here
        const clamped = clampPan(next, baseTx.value + e.translationX, baseTy.value + e.translationY);
        tx.value = clamped.x;
        ty.value = clamped.y;
      }),
    [size.width, size.height],
  );

  // Double tap: if zoomed in, reset; otherwise zoom in toward tap point.
  const doubleTap = useMemo(
    () => Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(280)
      .onEnd((e) => {
        const isZoomed = scale.value > minScale * 1.05;
        if (isZoomed) {
          scale.value = withTiming(1, { duration: 220 });
          tx.value = withTiming(0, { duration: 220 });
          ty.value = withTiming(0, { duration: 220 });
        } else {
          // Zoom toward the tapped point. Container center is the anchor;
          // adjust translation so the world point under the finger stays put.
          const cx = size.width / 2;
          const cy = size.height / 2;
          const fx = e.x - cx;
          const fy = e.y - cy;
          const target = Math.min(maxScale, doubleTapZoom);
          scale.value = withSpring(target, { damping: 18, stiffness: 180 });
          const clamped = clampPan(target, -fx * (target - 1), -fy * (target - 1));
          tx.value = withSpring(clamped.x, { damping: 18, stiffness: 180 });
          ty.value = withSpring(clamped.y, { damping: 18, stiffness: 180 });
        }
      }),
    [size.width, size.height, minScale, maxScale, doubleTapZoom],
  );

  // Single tap: forward to onTap with the screen-space point. Runs only when
  // the gesture didn't pan/pinch — handled by requiring minimal movement.
  const singleTap = useMemo(
    () => Gesture.Tap()
      .numberOfTaps(1)
      .maxDelay(220)
      .requireExternalGestureToFail(doubleTap)
      .onEnd((e) => { if (onTap) runOnJS(onTap)(e.x, e.y); }),
    [onTap, doubleTap],
  );

  const composed = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan, singleTap));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
});
const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  content: { flex: 1, width: '100%', height: '100%' },
});

export default ZoomableSvg;