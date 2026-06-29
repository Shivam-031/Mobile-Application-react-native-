const express = require('express');
const router = express.Router();
const CarbonData = require('../model/CarbonData');
const { protect } = require('../../../middleware/authMiddleware');

const FACTORS = {
  travel: { car_petrol: 0.21, car_diesel: 0.17, bike: 0.09, bus: 0.04, train: 0.014, flight_domestic: 0.255 },
  food: { beef: 27, chicken: 6.9, fish: 5.4, vegetarian: 2.5, vegan: 1.5 },
  energy: { electricity: 0.82, lpg: 2.98 },
};

// POST /carbon/calculate
router.post('/calculate', protect, async (req, res) => {
  try {
    const { travelMode, travelKm, foodType, foodKg, electricity, lpg, month, year } = req.body;
    const travelCO2 = (travelKm || 0) * (FACTORS.travel[travelMode] || 0);
    const foodCO2 = (foodKg || 0) * (FACTORS.food[foodType] || 0);
    const elCO2 = (electricity || 0) * FACTORS.energy.electricity;
    const lpgCO2 = (lpg || 0) * FACTORS.energy.lpg;
    const total = travelCO2 + foodCO2 + elCO2 + lpgCO2;
    const treesNeeded = Math.ceil(total / 21);

    const record = await CarbonData.findOneAndUpdate(
      { userId: req.user._id, month: month || new Date().getMonth() + 1, year: year || new Date().getFullYear() },
      {
        travel: { mode: travelMode, km: travelKm, co2: travelCO2 },
        food: { type_: foodType, kg: foodKg, co2: foodCO2 },
        electricity: { kwh: electricity, co2: elCO2 },
        lpg: { kg: lpg, co2: lpgCO2 },
        totalGenerated: total,
        treesNeeded,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { totalGenerated: total.toFixed(2), treesNeeded, breakdown: { travel: travelCO2.toFixed(2), food: foodCO2.toFixed(2), electricity: elCO2.toFixed(2), lpg: lpgCO2.toFixed(2) }, record } });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// GET /carbon/history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await CarbonData.find({ userId: req.user._id }).sort({ year: -1, month: -1 }).limit(12);
    res.json({ success: true, data: history });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
