const mongoose = require('mongoose');

const interruptionSchema = new mongoose.Schema(
  {
    equipmentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    stationId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Station',   required: true },
    tripTime:        { type: Date, required: true },
    restoreTime:     { type: Date, default: null },
    durationMinutes: { type: Number, default: null },
    reason:          { type: String, trim: true, default: null },
    causeCode:       { type: String, trim: true, default: null },
    notes:           { type: String, trim: true, default: null },
    status:          { type: String, enum: ['active', 'restored'], default: 'active' },
    // Multi-equipment interruption support
    equipmentList:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

interruptionSchema.index({ stationId: 1, status: 1 });
interruptionSchema.index({ equipmentId: 1, tripTime: -1 });
interruptionSchema.index({ tripTime: -1 });

module.exports = mongoose.model('Interruption', interruptionSchema);
