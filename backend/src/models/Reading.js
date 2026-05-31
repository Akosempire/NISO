const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    stationId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Station',   required: true },
    hour:        { type: Number, required: true, min: 0, max: 23 },
    date:        { type: Date,   required: true },
    // Meter values — null acceptable for hybrid "O/S" entries
    amperage:    { type: Number, default: null },
    mw:          { type: Number, default: null },
    mvar:        { type: Number, default: null },
    kv:          { type: Number, default: null },
    temperature: { type: Number, default: null },
    // Hybrid operational code support (e.g. "O/S" = Out of Service)
    rawInput:    { type: String, trim: true, default: null },
    valueType:   { type: String, enum: ['number', 'code', 'text'], default: 'number' },
    remarks:     { type: String, trim: true, default: null },
    // Sealing
    status:      { type: String, enum: ['pending', 'sealed'], default: 'pending' },
    sealedAt:    { type: Date, default: null },
    sealedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Prevent duplicate reading for same equipment + date + hour
readingSchema.index({ equipmentId: 1, date: 1, hour: 1 }, { unique: true });
readingSchema.index({ stationId: 1, date: 1 });
readingSchema.index({ status: 1, stationId: 1 });

module.exports = mongoose.model('Reading', readingSchema);
