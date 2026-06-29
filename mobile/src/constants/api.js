export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api/v1'
  : 'https://api.greenyatra.in/api/v1';

export const ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,
  ME: '/auth/me',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  PRODUCTS_BRANCH_MINE: '/products/branch/mine',
  ANALYTICS_BRANCH: '/analytics/branch',
  PLANTS: '/plants',
  CARBON_CALCULATE: '/carbon/calculate',
  CARBON_HISTORY: '/carbon/history',
  ORDERS: '/orders',
  ORDERS_BRANCH: '/orders/branch/all',
  LOCATIONS: '/locations',
  STATE_ANALYTICS: (name) => `/analytics/state/${encodeURIComponent(name)}`,
  STATE_CITIES: (name) => `/analytics/state/${encodeURIComponent(name)}/cities`,
  STATE_LEADERBOARD: (name) => `/analytics/state/${encodeURIComponent(name)}/leaderboard`,
};
