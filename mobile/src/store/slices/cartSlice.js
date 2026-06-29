import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persisted to AsyncStorage so a cart survives app refresh, navigation
// away from Marketplace, or killing the screen stack (which is what was
// happening before — Marketplace held cart in useState, ProductDetailScreen
// navigated without forwarding it, and CartScreen re-initialized to []).
const STORAGE_KEY = 'cartItems';

const loadInitial = () => {
  // Hydration happens async in hydrateCart() below; start with an empty
  // array so the first render is consistent across server/client and
  // doesn't blow up if AsyncStorage isn't ready yet.
  return [];
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadInitial(),
    hydrated: false,
  },
  reducers: {
    hydrateCart: (state, action) => {
      // Replace the empty initial items with whatever was persisted. Runs
      // once at app startup; subsequent hydrations are no-ops.
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.hydrated = true;
    },
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((i) => i._id === product._id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...product, qty: 1 });
      }
      // Persist outside the reducer (see persist below) — slice stays pure.
    },
    incrementQty: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) item.qty += 1;
    },
    decrementQty: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) state.items = state.items.filter((i) => i._id !== action.payload);
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

// Thunks — keep persistence side effects out of reducers so reducers stay
// pure and Reactotron / time-travel debugging keeps working.
export const hydrateCartFromStorage = () => async (dispatch) => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    dispatch(hydrateCart(raw ? JSON.parse(raw) : []));
  } catch {
    dispatch(hydrateCart([]));
  }
};

const persist = (items) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {
    // Swallow — losing a persist write is recoverable on next add; we
    // don't want to crash the cart UI over a storage hiccup.
  });
};

// Wrap each mutating action so the slice still owns the state shape but
// the persistence effect runs after the reducer commits.
export const addToCart = (product) => (dispatch, getState) => {
  dispatch(cartSlice.actions.addToCart(product));
  persist(getState().cart.items);
};
export const incrementQty = (id) => (dispatch, getState) => {
  dispatch(cartSlice.actions.incrementQty(id));
  persist(getState().cart.items);
};
export const decrementQty = (id) => (dispatch, getState) => {
  dispatch(cartSlice.actions.decrementQty(id));
  persist(getState().cart.items);
};
export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch(cartSlice.actions.removeFromCart(id));
  persist(getState().cart.items);
};
export const clearCart = () => (dispatch, getState) => {
  dispatch(cartSlice.actions.clearCart());
  persist(getState().cart.items);
};

export const { hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;