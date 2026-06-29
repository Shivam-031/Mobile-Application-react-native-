// Green Yatra India — All Eco Product Categories
// Phase 1: Organic Pots | Phase 2: Extended categories

export const PRODUCT_CATEGORIES = [
  // Phase 1 — Organic Pots (live now)
  { id: 'small', label: 'Small Pots', emoji: '🪴', group: 'pots', live: true },
  { id: 'medium', label: 'Medium Pots', emoji: '🏺', group: 'pots', live: true },
  { id: 'large', label: 'Large Pots', emoji: '🫙', group: 'pots', live: true },
  { id: 'decorative', label: 'Decorative', emoji: '🎋', group: 'pots', live: true },
  { id: 'custom', label: 'Custom Pots', emoji: '✨', group: 'pots', live: true },

  // Phase 2 — Future eco products (coming soon)
  { id: 'phool', label: 'Phool Products', emoji: '🌸', group: 'phool', live: false, comingSoon: true,
    description: 'Incense, packaging & eco-products made from temple flowers' },
  { id: 'bamboo', label: 'Bamboo Products', emoji: '🎋', group: 'bamboo', live: false, comingSoon: true,
    description: 'Bamboo furniture, utensils, bottles and accessories' },
  { id: 'recycled', label: 'Recycled Items', emoji: '♻️', group: 'recycled', live: false, comingSoon: true,
    description: 'Products made from recycled plastic, paper and textiles' },
  { id: 'organic', label: 'Organic Items', emoji: '🌿', group: 'organic', live: false, comingSoon: true,
    description: 'Certified organic seeds, fertilizers, and plant food' },
  { id: 'accessories', label: 'Plant Accessories', emoji: '🌻', group: 'accessories', live: false, comingSoon: true,
    description: 'Watering cans, trellises, soil mixes, and plant supports' },
];

export const LIVE_CATEGORIES = PRODUCT_CATEGORIES.filter((c) => c.live);
export const COMING_SOON_CATEGORIES = PRODUCT_CATEGORIES.filter((c) => c.comingSoon);

export const getCategoryById = (id) => PRODUCT_CATEGORIES.find((c) => c.id === id);
