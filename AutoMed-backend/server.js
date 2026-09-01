require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const verificationRoutes = require('./routes/verification');

const app = express();

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'AutoMed Visa API running' }));

const PORT = process.env.PORT || 5000;

// Only connect + listen when run directly (keeps server.js testable/importable)
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
