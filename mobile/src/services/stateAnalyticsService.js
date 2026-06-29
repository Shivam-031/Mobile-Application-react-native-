import api from './apiService';
import { ENDPOINTS } from '../constants/api';
import { generateMockStateData } from './mockStateData';

/**
 * State analytics service.
 *
 * Today the backend doesn't expose /analytics/state/:name endpoints, so every
 * call attempts the real API first and silently falls back to a deterministic
 * mock generator. When backend routes land, replace the try/catch with a
 * straight `api.get(...)` — the shape returned is already the same.
 */

// In-module cache so re-entering a state dashboard is instant. Keyed by state.
const cache = new Map();

async function tryApi(loader, fallback) {
  try {
    const res = await loader();
    if (res?.data?.success && res.data.data) return res.data.data;
    return fallback();
  } catch (e) {
    // 404 / network / parse — all fall through to mock
    return fallback();
  }
}

export async function getStateDashboard(stateName) {
  if (cache.has(stateName)) return cache.get(stateName);

  const mock = () => {
    const data = generateMockStateData(stateName);
    cache.set(stateName, data);
    return data;
  };

  // Single request covers everything — the dashboard pulls cities, KPIs,
  // analytics, and leaderboard from one payload to keep round-trips down.
  const data = await tryApi(
    () => api.get(ENDPOINTS.STATE_ANALYTICS(stateName)),
    mock,
  );

  // Always cache, even if backend succeeded, so back-navigation is instant.
  cache.set(stateName, data);
  return data;
}

export async function getStateCitySales(stateName, filters = {}) {
  const data = await getStateDashboard(stateName);
  return applyFilters(data.cities, filters);
}

export async function getStateLeaderboard(stateName) {
  const data = await getStateDashboard(stateName);
  return data.leaderboard;
}

/** Clear cache (e.g. on logout or when user pulls-to-refresh). */
export function clearStateAnalyticsCache() {
  cache.clear();
}

// --- helpers ---

function applyFilters(cities, filters) {
  let out = cities;
  if (filters.district && filters.district !== 'all') {
    out = out.filter((c) => c.district === filters.district);
  }
  if (filters.sustainabilityTier && filters.sustainabilityTier !== 'all') {
    const min = { platinum: 85, gold: 70, silver: 55 }[filters.sustainabilityTier] || 0;
    out = out.filter((c) => c.sustainabilityScore >= min);
  }
  // Note: 'category' would join against topProducts/categorySales in the real
  // backend. For the mock it has no effect on city list — preserved here so
  // the filter wiring matches what the real endpoint will accept.
  return out;
}