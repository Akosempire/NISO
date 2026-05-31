const mongoose = require('mongoose');

const slaEntrySchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    stationId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Station',   required: true },
    feederId:    { type: String, required: true, trim: true },
    date:        { type: Date,   required: true },
    hour:        { type: Number, required: true, min: 0, max: 23 },
    forecastMw:  { type: Number, required: true },
    forecastPct: { type: Number, default: null },
    actualMw:    { type: Number, default: null },
    actualPct:   { type: Number, default: null },
    meterReadingKwh: { type: Number, default: null },
    varianceMw:  { type: Number, default: null },
    variance:    { type: Number, default: null },
    status:      { type: String, enum: ['pending', 'approved', 'warning'], default: 'pending' },
    approvedAt:  { type: Date, default: null },
    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    remarks:     { type: String, trim: true, default: null },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

slaEntrySchema.index({ stationId: 1, date: 1 });
slaEntrySchema.index({ equipmentId: 1, date: 1, hour: 1 });
slaEntrySchema.index({ status: 1, stationId: 1 });

module.exports = mongoose.model('SLAEntry', slaEntrySchema);
