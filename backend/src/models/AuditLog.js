const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action:     { type: String, required: true }, // create | update | delete
    entityType: { type: String, required: true }, // readings | sla | interruptions | etc.
    entityId:   { type: String, default: null },
    changes:    { type: mongoose.Schema.Types.Mixed, default: null },
    ipAddress:  { type: String, default: null },
    userAgent:  { type: String, default: null },
  },
  {
    timestamps: true,
    // AuditLog is immutable — block save/update after creation
    strict: true,
  }
);

// Immutability: prevent updates to audit logs
auditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('AuditLog records are immutable'));
  }
  next();
});

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
