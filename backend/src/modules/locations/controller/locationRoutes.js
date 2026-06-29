const express = require('express');
const router = express.Router();

const INDIA_STATES = [
  { name: 'Maharashtra', lat: 19.7515, lng: 75.7139, capital: 'Mumbai' },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025, capital: 'New Delhi' },
  { name: 'Kerala', lat: 10.8505, lng: 76.2711, capital: 'Thiruvananthapuram' },
  { name: 'Rajasthan', lat: 27.0238, lng: 74.2179, capital: 'Jaipur' },
  { name: 'Karnataka', lat: 15.3173, lng: 75.7139, capital: 'Bengaluru' },
  { name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, capital: 'Chennai' },
  { name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, capital: 'Lucknow' },
  { name: 'Gujarat', lat: 22.2587, lng: 71.1924, capital: 'Gandhinagar' },
  { name: 'West Bengal', lat: 22.9868, lng: 87.8550, capital: 'Kolkata' },
  { name: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569, capital: 'Bhopal' },
  { name: 'Telangana', lat: 18.1124, lng: 79.0193, capital: 'Hyderabad' },
  { name: 'Andhra Pradesh', lat: 15.9129, lng: 79.7400, capital: 'Amaravati' },
  { name: 'Punjab', lat: 31.1471, lng: 75.3412, capital: 'Chandigarh' },
  { name: 'Odisha', lat: 20.9517, lng: 85.0985, capital: 'Bhubaneswar' },
  { name: 'Assam', lat: 26.2006, lng: 92.9376, capital: 'Dispur' },
];

router.get('/states', (req, res) => {
  res.json({ success: true, data: INDIA_STATES });
});

router.get('/states/:name/stats', async (req, res) => {
  try {
    const Product = require('../../products/model/Product');
    const Plant = require('../../plants/model/Plant');

    const [products, plants, carbonData] = await Promise.all([
      Product.countDocuments({ state: req.params.name, status: 'approved' }),
      Plant.countDocuments({ states: req.params.name, isActive: true }),
      Product.aggregate([
        { $match: { state: req.params.name, status: 'approved' } },
        { $group: { _id: null, totalCarbon: { $sum: { $multiply: ['$carbonSaved', '$soldCount'] } } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        state: req.params.name,
        products,
        plants,
        carbonImpact: carbonData[0]?.totalCarbon?.toFixed(2) || 0,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
