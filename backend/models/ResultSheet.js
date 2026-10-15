const mongoose = require('mongoose');

// Har class aur section ke liye sirf aik latest result PDF ka record rakha jata hai.
const resultSheetSchema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
}, { timestamps: true });

resultSheetSchema.index({ className: 1, section: 1 }, { unique: true });

module.exports = mongoose.models.ResultSheet
  || mongoose.model('ResultSheet', resultSheetSchema);
