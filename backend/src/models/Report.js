const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    stationId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    reportType:  { type: String, required: true, trim: true },
    title:       { type: String, required: true, trim: true },
    format:      { type: String, enum: ['pdf', 'excel'], required: true },
    filePath:    { type: String, trim: true, default: null },
    parameters:  { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

reportSchema.index({ stationId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
