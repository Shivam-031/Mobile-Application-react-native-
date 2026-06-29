import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiService';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/products?${query}`);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch products'); }
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Product not found'); }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    selected: null,
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    error: null,
    cart: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.cart.find((i) => i._id === action.payload._id);
      if (existing) { existing.qty += 1; }
      else { state.cart.push({ ...action.payload, qty: 1 }); }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((i) => i._id !== action.payload);
    },
    updateCartQty: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.cart.find((i) => i._id === id);
      if (item) { item.qty = Math.max(1, qty); }
    },
    clearCart: (state) => { state.cart = []; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.products || action.payload;
        state.total = action.payload.total || state.list.length;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductById.pending, (state) => { state.loading = true; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { addToCart, removeFromCart, updateCartQty, clearCart, clearError } = productsSlice.actions;
export const selectCartTotal = (state) => state.products.cart.reduce((acc, i) => acc + i.price * i.qty, 0);
export const selectCartCount = (state) => state.products.cart.reduce((acc, i) => acc + i.qty, 0);
export const selectCartCarbon = (state) => state.products.cart.reduce((acc, i) => acc + i.carbonSaved * i.qty, 0);
export default productsSlice.reducer;
