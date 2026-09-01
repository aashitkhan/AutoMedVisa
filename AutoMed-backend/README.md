# AutoMed Visa — Backend

Smart Verification System for Automobile Sector Migrant Workers — MERN backend.

Automatically cross-verifies a migrant worker's job offer against their visa
category, flagging mismatches using a custom DSA-based risk-scoring algorithm
before the worker travels.

## Live API
https://automed-backend.onrender.com

## Setup
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run seed            # (or: node seed.js) populates sample visa categories
npm run dev              # starts server on port 5000
```

## Run tests
```bash
npm test
```
9 Jest unit tests covering the risk-scoring engine (Levenshtein distance,
similarity scoring, and full risk calculation across match/mismatch cases).

## API Endpoints
- `POST /api/auth/register` — create account (worker/employer/admin)
- `POST /api/auth/login` — get JWT token
- `POST /api/verification` — submit job title + visaCode + document (multipart/form-data)
- `GET /api/verification/me` — worker's own submissions
- `GET /api/verification?riskLevel=High` — admin: all flagged submissions

## Sample visa codes (after seeding)
- `UAE-DRV-01` — Light Motor Vehicle Driver
- `UAE-MECH-02` — Automobile Mechanic / Technician
- `SAU-HDT-03` — Heavy Duty Truck Operator
- `QAT-FLT-04` — Fleet Supervisor
- `UAE-GEN-05` — General Labourer

## Core algorithm
`utils/riskScore.js` implements Levenshtein distance (DP) for fuzzy job-title
matching, then a weighted formula combining match confidence + visa category
severity to produce a 0-100 risk score.

## Tech Stack
Node.js, Express, MongoDB, Mongoose, JWT, Multer, Nodemailer, Jest, Supertest

## Frontend Repository
https://github.com/tumhara-username/automed-visa-frontend

## Author

**Aashit Khan**
- GitHub: [@tumhara-username](https://github.com/tumhara-username)
