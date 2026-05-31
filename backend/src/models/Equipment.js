const mongoose = require('mongoose');

const EQUIPMENT_STATUSES = ['active', 'inactive', 'maintenance', 'decommissioned'];

const equipmentSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    type:          { type: String, required: true, trim: true },
    stationId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    model:         { type: String, trim: true },
    serialNumber:  { type: String, trim: true },
    installedDate: { type: Date },
    status:        { type: String, enum: EQUIPMENT_STATUSES, default: 'active' },
    slaTarget:     { type: Number, default: 95, min: 0, max: 100 },
  },
  { timestamps: true }
);

equipmentSchema.index({ stationId: 1, status: 1 });
equipmentSchema.index({ stationId: 1, name: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
