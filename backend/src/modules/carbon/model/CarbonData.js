const mongoose = require('mongoose');

const carbonDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  travel: { mode: String, km: Number, co2: Number },
  food: { type_: String, kg: Number, co2: Number },
  electricity: { kwh: Number, co2: Number },
  lpg: { kg: Number, co2: Number },
  totalGenerated: { type: Number, required: true },
  totalSaved: { type: Number, default: 0 },
  treesNeeded: { type: Number, default: 0 },
  suggestions: [String],
}, { timestamps: true });

carbonDataSchema.index({ userId: 1, year: 1, month: 1 });
module.exports = mongoose.model('CarbonData', carbonDataSchema);
