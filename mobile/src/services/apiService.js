import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL, ENDPOINTS } from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // Server logs and any WAF/CDN rules care about a real User-Agent
    // string. RN's default `okhttp/...` is opaque.
    'User-Agent': `GreenYatraMobile/1.0 (${Platform.OS} ${Platform.Version})`,
  },
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const res = await axios.post(`${API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // Dispatch logout action here if using Redux
      }
    }
    return Promise.reject(error);
  }
);

export default api;
