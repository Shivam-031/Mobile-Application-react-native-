/**
 * Shared MapLibre helpers and re-exports for the GreenYatraIndia app.
 *
 * Migration note: replaces react-native-maps (Google provider). MapLibre does
 * NOT require an API key — the OpenStreetMap raster tiles served from
 * tile.openstreetmap.org are open data, but the OSMF tile usage policy still
 * requires visible attribution:
 *   https://operations.osmfoundation.org/policies/tiles/
 * Use the <OSMTileAttribution /> component in any screen that loads this style.
 */
import MapLibreGL from '@maplibre/maplibre-react-native';

// MapLibre requires an explicit access-token call even when using a non-Mapbox
// style. Passing null clears the default Mapbox token check.
MapLibreGL.setAccessToken(null);

// OpenStreetMap raster tile style (MapLibre Style Specification v8).
// Using raster tiles keeps the dependency footprint small (no vector tiles
// server) and is appropriate for a national-scale dashboard.
export const OSM_STYLE_URL = JSON.stringify({
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
});

// Re-export the MapLibre primitives we use across screens.
// Consumers can `import { MapView, MarkerView, Camera } from './MapLibreMap'`.
export const MapView = MapLibreGL.MapView;
export const Camera = MapLibreGL.Camera;
export const MarkerView = MapLibreGL.MarkerView;
export const ShapeSource = MapLibreGL.ShapeSource;
export const CircleLayer = MapLibreGL.CircleLayer;
export const FillLayer = MapLibreGL.FillLayer;
export const LineLayer = MapLibreGL.LineLayer;
export const SymbolLayer = MapLibreGL.SymbolLayer;
export const PointAnnotation = MapLibreGL.PointAnnotation;

/**
 * Convert react-native-maps-style {latitudeDelta} to a MapLibre zoom level.
 * react-native-maps uses latitudeDelta in degrees; MapLibre uses zoom where
 * each integer step roughly doubles/halves the visible map width.
 */
export const deltaToZoom = (latitudeDelta) => {
  if (!latitudeDelta || latitudeDelta <= 0) return 4;
  return Math.max(1, Math.min(20, Math.log2(360 / latitudeDelta)));
};

/**
 * Build a GeoJSON FeatureCollection from a list of {lat, lng, ...props}.
 * MapLibre uses [longitude, latitude] ordering — opposite of react-native-maps.
 */
export const pointsToGeoJSON = (points, propsExtractor = () => ({})) => ({
  type: 'FeatureCollection',
  features: points.map((p) => ({
    type: 'Feature',
    properties: propsExtractor(p),
    geometry: {
      type: 'Point',
      coordinates: [p.lng ?? p.longitude, p.lat ?? p.latitude],
    },
  })),
});

export default MapLibreGL;