import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiService';

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/my');
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders'); }
});

export const placeOrder = createAsyncThunk('orders/place', async (orderData, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', orderData);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to place order'); }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    loading: false,
    placing: false,
    error: null,
    lastOrder: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearLastOrder: (state) => { state.lastOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(placeOrder.pending, (state) => { state.placing = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placing = false;
        state.lastOrder = action.payload;
        state.list.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => { state.placing = false; state.error = action.payload; });
  },
});

export const { clearError, clearLastOrder } = ordersSlice.actions;
export const selectTotalCarbonSaved = (state) => state.orders.list.reduce((acc, o) => acc + (o.totalCarbonSaved || 0), 0);
export default ordersSlice.reducer;
