import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiService';

export const fetchPlants = createAsyncThunk('plants/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/plants?${query}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch plants'); }
});

export const fetchPlantStats = createAsyncThunk('plants/stats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/plants/stats/summary');
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats'); }
});

const plantsSlice = createSlice({
  name: 'plants',
  initialState: {
    list: [],
    stats: { total: 0, native: 0, protected: 0, statesCovered: 0 },
    savedPlants: [],
    loading: false,
    error: null,
  },
  reducers: {
    toggleSavePlant: (state, action) => {
      const plant = action.payload;
      const idx = state.savedPlants.findIndex((p) => p._id === plant._id);
      if (idx >= 0) state.savedPlants.splice(idx, 1);
      else state.savedPlants.push(plant);
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlants.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPlants.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload;
      })
      .addCase(fetchPlants.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPlantStats.fulfilled, (state, action) => { state.stats = action.payload; });
  },
});

export const { toggleSavePlant, clearError } = plantsSlice.actions;
export default plantsSlice.reducer;
