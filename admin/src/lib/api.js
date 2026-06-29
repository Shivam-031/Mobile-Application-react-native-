import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  // axios falls back to the browser's default UA string when nothing is set,
  // so we explicitly forward NEXT_PUBLIC_USER_AGENT (or USER_AGENT) — this
  // lets the backend log *which* admin app version made a request. Falls
  // back to a sensible default if the env var isn't provided in prod.
  headers: { 'User-Agent': process.env.NEXT_PUBLIC_USER_AGENT || process.env.USER_AGENT || 'GreenYatraAdmin/1.0' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    // 401 = token invalid/expired → force re-login.
    // 403 = authenticated but role not authorized for this endpoint (e.g.
    // an Employee token hitting /products/:id/approve). Also kick to login
    // so the user sees the existing admin-only gate instead of a silent
    // failure or stale UI.
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
