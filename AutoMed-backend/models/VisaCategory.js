const mongoose = require('mongoose');

// Core taxonomy: maps a visa category to the automobile-sector job roles
// it legitimately permits. This is the domain database that makes VisaGuard
// automobile-sector-specific (the key differentiator from generic immigration tools).
const visaCategorySchema = new mongoose.Schema(
  {
    visaCode: { type: String, required: true, unique: true, trim: true }, // e.g. "UAE-DRV-2"
    visaCategoryName: { type: String, required: true, trim: true }, // e.g. "Light Motor Vehicle Driver"
    country: { type: String, required: true, trim: true },
    allowedJobRoles: [{ type: String, trim: true }], // ["Taxi Driver", "Delivery Driver", "LMV Driver"]
    disallowedJobRoles: [{ type: String, trim: true }], // ["Heavy Truck Operator", "Auto Mechanic"]
    riskWeight: { type: Number, default: 1, min: 1, max: 10 } // base severity weight for mismatches on this category
  },
  { timestamps: true }
);

module.exports = mongoose.model('VisaCategory', visaCategorySchema);
