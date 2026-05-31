const mongoose = require('mongoose');

const ROLES = [
  'HQ_ADMIN',
  'ICT_ADMIN',
  'REGIONAL_ADMIN',
  'STATION_ADMIN',
  'SUPERVISOR',
  'OPERATOR',
  'VIEWER',
  'KNOWLEDGE_ADMIN',
];

const userSchema = new mongoose.Schema(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName:    { type: String, required: true, trim: true },
    lastName:     { type: String, required: true, trim: true },
    role:         { type: String, required: true, enum: ROLES },
    stationId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Station', default: null },
    regionId:     { type: String, default: null },
    isActive:     { type: Boolean, default: true },
    lastLogin:    { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ stationId: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
