const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    equipmentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    stationId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Station',   required: true },
    inspectionDate:  { type: Date, required: true },
    inspectorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    findings:        { type: String, trim: true, default: null },
    status:          { type: String, enum: ['scheduled', 'in-progress', 'completed', 'failed'], default: 'in-progress' },
    severity:        { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    resolvedAt:      { type: Date, default: null },
  },
  { timestamps: true }
);

inspectionSchema.index({ stationId: 1, status: 1 });
inspectionSchema.index({ equipmentId: 1, inspectionDate: -1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
