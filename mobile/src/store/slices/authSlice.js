import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/apiService';
import { ENDPOINTS } from '../../constants/api';

// Extract a user-facing error message from an axios error. Backend may return
// either { message } (single error) or { errors: [{ msg }, ...] } (express-
// validator failure). Falls back to the supplied default for network errors /
// timeouts where there's no response body at all.
const extractErrorMessage = (err, fallback) => {
  const data = err.response?.data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.msg).join(', ');
  }
  return fallback;
};

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await api.post(ENDPOINTS.REGISTER, userData);
    const { accessToken, refreshToken, user } = res.data.data;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    return user;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Registration failed'));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post(ENDPOINTS.LOGIN, credentials);
    const { accessToken, refreshToken, user } = res.data.data;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    return user;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Login failed'));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post(ENDPOINTS.LOGOUT);
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Logout failed'));
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(ENDPOINTS.ME);
    return res.data.data.user;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to fetch user'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload; state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, rejected)
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload; state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, rejected)
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.isAuthenticated = false; state.loading = false;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload; state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null; state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
