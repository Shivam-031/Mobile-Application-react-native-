/**
 * Type definitions for the State Dashboard feature.
 * JSDoc-only — no runtime cost. Useful for editor intellisense and as a
 * contract for the eventual real backend API.
 */

/**
 * @typedef {Object} CitySales
 * @property {string} id
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 * @property {string} district
 * @property {number} revenue          // INR
 * @property {number} orders
 * @property {number} ecoProducts
 * @property {number} carbonSaved      // kg
 * @property {number} treesPlanted
 * @property {number} activeCustomers
 * @property {number} branches
 * @property {number} growthPct        // e.g. 18 for +18%
 * @property {number} sustainabilityScore // 0-100
 * @property {string} lastUpdated      // ISO date
 */

/**
 * @typedef {Object} StateKpis
 * @property {number} revenue
 * @property {number} orders
 * @property {number} ecoProducts
 * @property {number} carbonSaved
 * @property {number} treesPlanted
 * @property {number} sustainabilityScore
 */

/**
 * @typedef {Object} SeriesPoint
 * @property {string} label
 * @property {number} value
 */

/**
 * @typedef {Object} AnalyticsData
 * @property {SeriesPoint[]} monthly
 * @property {SeriesPoint[]} weekly
 * @property {SeriesPoint[]} daily
 * @property {{name: string, sold: number, revenue: number}[]} topProducts
 * @property {{category: string, share: number, value: number}[]} categorySales
 * @property {{label: string, carbon: number, trees: number}[]} carbonTrend
 * @property {{
 *   newCustomers: number,
 *   returningCustomers: number,
 *   repeatRate: number,
 *   growthPct: number,
 *   trend: SeriesPoint[],
 * }} customerInsights
 */

/**
 * @typedef {Object} LeaderboardData
 * @property {CitySales[]} byRevenue
 * @property {CitySales[]} byOrders
 * @property {CitySales[]} byCarbon
 * @property {CitySales[]} byTrees
 * @property {CitySales[]} byGrowth
 * @property {CitySales[]} bySustainability
 */

/**
 * @typedef {Object} DashboardFilters
 * @property {string} district          // 'all' or district name
 * @property {string} category          // 'all' | 'pots' | 'plants' | 'decor' | 'accessories'
 * @property {'all'|'platinum'|'gold'|'silver'} sustainabilityTier
 */

/**
 * @typedef {'revenue'|'orders'|'carbonSaved'|'growthPct'|'treesPlanted'} SortKey
 */

/**
 * @typedef {Object} StateDashboardPayload
 * @property {{name: string, lat: number, lng: number}} state
 * @property {StateKpis} kpis
 * @property {AnalyticsData} analytics
 * @property {LeaderboardData} leaderboard
 * @property {CitySales[]} cities
 */

export {};