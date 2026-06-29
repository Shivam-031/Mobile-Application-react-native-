import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiService';

export const fetchCarbonHistory = createAsyncThunk('carbon/history', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/carbon/history');
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch history'); }
});

export const submitCarbonCalc = createAsyncThunk('carbon/calculate', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/carbon/calculate', data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Calculation failed'); }
});

const carbonSlice = createSlice({
  name: 'carbon',
  initialState: {
    history: [],
    lastResult: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearResult: (state) => { state.lastResult = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarbonHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchCarbonHistory.fulfilled, (state, action) => { state.loading = false; state.history = action.payload; })
      .addCase(fetchCarbonHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(submitCarbonCalc.pending, (state) => { state.loading = true; })
      .addCase(submitCarbonCalc.fulfilled, (state, action) => { state.loading = false; state.lastResult = action.payload; })
      .addCase(submitCarbonCalc.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError, clearResult } = carbonSlice.actions;
export default carbonSlice.reducer;
