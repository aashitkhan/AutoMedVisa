const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');
const express = require('express');
const multer = require('multer');
const Verification = require('../models/Verification');
const VisaCategory = require('../models/VisaCategory');
const { protect, adminOnly } = require('../middleware/auth');
const { calculateRiskScore } = require('../utils/riskScore');

const router = express.Router();

// Store uploaded documents locally (uploads/ folder)
// Store uploaded documents locally (uploads/ folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
  }
});

// POST /api/verification  (worker submits job title + visa code + document)
router.post('/', protect, (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large — maximum size is 5MB'
        : err.message;
      return res.status(400).json({ message });
    }
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { submittedJobTitle, visaCode, country } = req.body;
    if (!submittedJobTitle || !visaCode || !country) {
      return res.status(400).json({ message: 'submittedJobTitle, visaCode, and country are required' });
    }

    const visaCategory = await VisaCategory.findOne({ visaCode });
    if (!visaCategory) {
      return res.status(404).json({ message: `Unknown visa code: ${visaCode}` });
    }

    const result = calculateRiskScore(submittedJobTitle, visaCategory);

    const verification = await Verification.create({
      worker: req.user.id,
      submittedJobTitle,
      visaCode,
      country,
      documentUrl: req.file ? req.file.path : undefined,
      isMatch: result.isMatch,
      matchedVisaCategory: result.matchedVisaCategory,
      mismatchReasons: result.mismatchReasons,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      status: result.isMatch ? 'verified' : 'flagged'
    });

    res.status(201).json(verification);

    User.findById(req.user.id)
      .then((worker) => {
        if (worker) return sendVerificationEmail({ to: worker.email, name: worker.name, result });
      })
      .catch((err) => console.error('[verification] email step failed:', err.message));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/verification/me  (worker's own submissions)
router.get('/me', protect, async (req, res) => {
  const records = await Verification.find({ worker: req.user.id }).sort('-createdAt');
  res.json(records);
});

// GET /api/verification  (admin - all submissions, filterable by riskLevel/status)
router.get('/', protect, adminOnly, async (req, res) => {
  const { riskLevel, status } = req.query;
  const filter = {};
  if (riskLevel) filter.riskLevel = riskLevel;
  if (status) filter.status = status;

  const records = await Verification.find(filter)
    .populate('worker', 'name email phone')
    .sort('-riskScore');
  res.json(records);
});

module.exports = router;
