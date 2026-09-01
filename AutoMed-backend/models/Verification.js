const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedJobTitle: { type: String, required: true, trim: true }, // from job offer letter
    visaCode: { type: String, required: true, trim: true }, // from visa document
    documentUrl: { type: String }, // path to uploaded file (multer)
    country: { type: String, required: true },

    // Result of the rule engine
    isMatch: { type: Boolean, default: null },
    matchedVisaCategory: { type: String },
    mismatchReasons: [{ type: String }],

    // DSA-based weighted risk score (0-100)
    riskScore: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },

    status: { type: String, enum: ['pending', 'verified', 'flagged'], default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', verificationSchema);
