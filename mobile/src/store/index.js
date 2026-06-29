import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import plantsReducer from './slices/plantsSlice';
import ordersReducer from './slices/ordersSlice';
import carbonReducer from './slices/carbonSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    plants: plantsReducer,
    orders: ordersReducer,
    carbon: carbonReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
