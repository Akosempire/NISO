const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    region:   { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    code:     { type: String, required: true, unique: true, uppercase: true, trim: true },
  },
  { timestamps: true }
);

stationSchema.index({ region: 1 });

module.exports = mongoose.model('Station', stationSchema);
