/**
 * Deterministic mock data generator for state dashboards.
 *
 * The same stateName always returns the same dataset — we seed a tiny
 * string-hash PRNG instead of Math.random() so that screens remain stable
 * across re-renders and reopens.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// xorshift32 — small, fast, deterministic. Seed must be non-zero.
function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;  s >>>= 0;
    // Clamp into [0, 1) — bitwise ops in JS are signed 32-bit so without
    // the divide the raw value can occasionally land at 1.0 which would
    // make Math.floor(rng() * arr.length) == arr.length → undefined.
    return ((s & 0xFFFFFFFF) >>> 0) / 0x100000000;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function intBetween(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
function floatBetween(rng, min, max) { return rng() * (max - min) + min; }

// Curated city pools per state. We pick 8-14 of them at random so the
// dashboard shows realistic variation without needing real GIS data.
const CITIES_BY_STATE = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai', 'Sangli', 'Akola'],
  Delhi: ['New Delhi', 'Old Delhi', 'Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar', 'Karol Bagh', 'Connaught Place', 'Mayur Vihar', 'Pitampura'],
  Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Kannur', 'Palakkad', 'Malappuram', 'Ernakulam'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar', 'Sri Ganganagar'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belgaum', 'Davanagere', 'Tumakuru', 'Shivamogga', 'Udupi', 'Coorg', 'Hassan'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Kanchipuram'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Morbi'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling', 'Malda', 'Burdwan', 'Kharagpur', 'Haldia'],
};

const DISTRICTS = ['Central', 'North', 'South', 'East', 'West', 'Coastal', 'Highlands', 'Metro'];

const TOP_PRODUCT_NAMES = [
  'Terracotta Pot', 'Bamboo Planter', 'Coir Basket', 'Self-Watering Pot',
  'Hanging Garden', 'Compost Bin', 'Seedling Tray', 'Vertical Garden',
  'Eco Bird House', 'Solar Lantern', 'Neem Pesticide', 'Vermicompost Kit',
];

const CATEGORIES = ['pots', 'plants', 'decor', 'accessories'];

/**
 * @param {string} stateName
 * @returns {import('./types').StateDashboardPayload}
 */
export function generateMockStateData(stateName) {
  const rng = makeRng(hashString(stateName));

  const pool = CITIES_BY_STATE[stateName] || CITIES_BY_STATE.Maharashtra;
  const cityCount = intBetween(rng, Math.min(8, pool.length), Math.min(14, pool.length));

  // Shuffle pool deterministically and take the first N
  const cityPool = [...pool];
  for (let i = cityPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cityPool[i], cityPool[j]] = [cityPool[j], cityPool[i]];
  }
  const selectedCities = cityPool.slice(0, cityCount);

  const cities = selectedCities.map((name, idx) => {
    const baseRevenue = intBetween(rng, 80_000, 800_000);
    const orders = intBetween(rng, 120, 1200);
    const ecoProducts = intBetween(rng, 250, 2400);
    const carbonSaved = floatBetween(rng, 1.5, 12).toFixed(2) * 1;
    const treesPlanted = intBetween(rng, 30, 900);
    const activeCustomers = intBetween(rng, 80, 2200);
    const branches = intBetween(rng, 1, 8);
    const growthPct = Math.round(floatBetween(rng, -8, 35));
    const sustainabilityScore = Math.min(100, Math.max(20, Math.round(floatBetween(rng, 40, 96))));

    // Pick a city coordinate near a base point inside the state bounding box.
    // Real coords aren't critical — the dashboard doesn't render a city map.
    return {
      id: `${stateName}-${idx}`,
      name,
      lat: 0, lng: 0, // filled by consumer if needed; kept simple here
      district: pick(rng, DISTRICTS),
      revenue: baseRevenue,
      orders,
      ecoProducts,
      carbonSaved,
      treesPlanted,
      activeCustomers,
      branches,
      growthPct,
      sustainabilityScore,
      lastUpdated: '2026-06-25',
    };
  });

  // Aggregate KPIs from cities — guarantees header numbers tie out to the list.
  const kpis = cities.reduce(
    (acc, c) => ({
      revenue: acc.revenue + c.revenue,
      orders: acc.orders + c.orders,
      ecoProducts: acc.ecoProducts + c.ecoProducts,
      carbonSaved: acc.carbonSaved + c.carbonSaved,
      treesPlanted: acc.treesPlanted + c.treesPlanted,
    }),
    { revenue: 0, orders: 0, ecoProducts: 0, carbonSaved: 0, treesPlanted: 0 },
  );
  kpis.sustainabilityScore = Math.round(
    cities.reduce((s, c) => s + c.sustainabilityScore, 0) / cities.length,
  );
  kpis.carbonSaved = Math.round(kpis.carbonSaved * 10) / 10;

  // Time series — month/week/day sales. Growth curve so the chart isn't flat.
  const monthly = MONTHS.map((label, i) => {
    const trend = 60 + i * 6 + floatBetween(rng, -10, 12);
    return { label, value: Math.max(20, Math.round(trend * 1000)) };
  });
  const weekly = WEEKS.map((label, i) => {
    const trend = 40 + i * 3 + floatBetween(rng, -8, 10);
    return { label, value: Math.max(15, Math.round(trend * 1000)) };
  });
  const daily = DAYS.map((label, i) => {
    // weekends spike a little
    const weekend = (label === 'Sat' || label === 'Sun') ? 15 : 0;
    return { label, value: Math.max(20, 30 + i * 4 + weekend + floatBetween(rng, -5, 8)) };
  });

  // Top products — pick a deterministic subset of the master list
  const productPool = [...TOP_PRODUCT_NAMES];
  for (let i = productPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [productPool[i], productPool[j]] = [productPool[j], productPool[i]];
  }
  const topProducts = productPool.slice(0, 6).map((name, i) => ({
    name,
    sold: Math.round(1200 - i * 150 + floatBetween(rng, -80, 80)),
    revenue: Math.round(45000 - i * 4500 + floatBetween(rng, -3000, 3000)),
  }));

  // Category split
  const catRaw = CATEGORIES.map((c) => ({ category: c, share: floatBetween(rng, 0.6, 1.4) }));
  const catSum = catRaw.reduce((s, c) => s + c.share, 0);
  const categorySales = catRaw.map((c) => ({
    category: c.category,
    share: Math.round((c.share / catSum) * 100),
    value: Math.round((c.share / catSum) * kpis.revenue),
  }));

  // Carbon trend (12 months)
  const carbonTrend = MONTHS.map((label, i) => ({
    label,
    carbon: Math.round((40 + i * 3.5 + floatBetween(rng, -4, 4)) * 10) / 10,
    trees: Math.round(50 + i * 6 + floatBetween(rng, -10, 14)),
  }));

  // Customer insights
  const newCustomers = Math.round(kpis.orders * floatBetween(rng, 0.35, 0.55));
  const returningCustomers = kpis.orders - newCustomers;
  const repeatRate = Math.round(floatBetween(rng, 22, 58));
  const customerGrowth = Math.round(floatBetween(rng, 5, 28));

  const customerInsights = {
    newCustomers,
    returningCustomers,
    repeatRate,
    growthPct: customerGrowth,
    trend: MONTHS.slice(0, 6).map((label, i) => ({
      label,
      value: 200 + i * 30 + Math.round(floatBetween(rng, -25, 35)),
    })),
  };

  // Leaderboard — top 5 across 6 dimensions
  const top5 = (sortFn) => [...cities].sort(sortFn).slice(0, 5);
  const leaderboard = {
    byRevenue: top5((a, b) => b.revenue - a.revenue),
    byOrders: top5((a, b) => b.orders - a.orders),
    byCarbon: top5((a, b) => b.carbonSaved - a.carbonSaved),
    byTrees: top5((a, b) => b.treesPlanted - a.treesPlanted),
    byGrowth: top5((a, b) => b.growthPct - a.growthPct),
    bySustainability: top5((a, b) => b.sustainabilityScore - a.sustainabilityScore),
  };

  return {
    state: { name: stateName, lat: 0, lng: 0 },
    kpis,
    analytics: {
      monthly,
      weekly,
      daily,
      topProducts,
      categorySales,
      carbonTrend,
      customerInsights,
    },
    leaderboard,
    cities,
  };
}