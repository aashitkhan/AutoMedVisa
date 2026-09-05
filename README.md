# AutoMed Visa

A full-stack MERN application that verifies automobile-sector migrant workers'
job titles against their visa categories before travel, flagging mismatches
using a custom risk-scoring algorithm (Levenshtein distance).

## Live Demo
- Frontend: https://auto-med-visa.vercel.app/
- Backend API: https://automed-visa-backend.onrender.com

## Why I Built This
Migrant workers travelling for automobile-sector jobs are often issued a visa
category that doesn't match their actual job role, due to a lack of awareness
about the verification process. This leads to serious challenges — deportation,
legal trouble, and financial loss — with no automated check available today.
AutoMed Visa solves this by cross-verifying job offers against visa categories
before travel.

## Features
- JWT authentication (worker / employer / admin roles)
- OCR-based document auto-fill (Tesseract.js + pdf.js)
- Custom DSA risk-scoring engine (Levenshtein distance)
- Admin analytics dashboard with charts
- Rule-based chatbot assistant
- Email notifications (Nodemailer)

## Tech Stack
**Frontend:** React, Vite, Tailwind CSS, Recharts, Tesseract.js, pdf.js, Axios
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Multer, Nodemailer
**Testing:** Jest, Supertest
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Project Structure
AutoMed-Visa/
├── AutoMed-backend/ # Express API, MongoDB models, risk-scoring engine
└── AutoMed-Frontend/ # React app, UI, OCR, analytics dashboard

## Demo Video
<!-- video link yahan aayega -->

## Screenshots
<!--  -->

## Local Setup

### Backend
```bash
cd AutoMed-backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd AutoMed-Frontend
npm install
npm run dev
```

## Author

**Aashit Khan**
- GitHub: [@aashitkhan](https://github.com/aashitkhan)
- LinkedIn: [Aashit Khan](https://linkedin.com/in/aashit-khan-04ab90299)
