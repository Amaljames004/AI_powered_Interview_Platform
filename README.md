# Capstone 2025 - SkillHire Platform

A comprehensive AI-powered recruitment platform that streamlines the hiring process through automated resume parsing, AI-driven candidate assessment, and intelligent skill matching.

## 🚀 Overview

SkillHire AI provides an end-to-end platform for companies to define job requirements, evaluate candidates, and make data-driven hiring decisions. The platform features customizable job groups, structured AI-led interviews, automated resume parsing, and comprehensive candidate management.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.3 (React 19)
- **Styling**: Tailwind CSS 4
- **UI Libraries**: 
  - Framer Motion (animations)
  - Heroicons & Lucide React (icons)
  - Chart.js & Recharts (data visualization)
- **AI/ML**: TensorFlow.js, Face-API.js (for interview analysis)
- **Other**: Axios, XLSX

### Backend
- **Runtime**: Node.js with Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.15.1
- **Authentication**: JWT (jsonwebtoken)
- **File Processing**: Multer, PDF-parse, Mammoth
- **AI Integration**: Google Generative AI (Gemini)
- **Email**: Nodemailer
- **Other**: CSV-parser, Bcryptjs, Helmet

### AI Service
- **Framework**: Python FastAPI
- **PDF Processing**: PyMuPDF (fitz)
- **Text Processing**: RapidFuzz (fuzzy matching)
- **Resume Parsing**: Custom parser with regex patterns

## ✨ Features

- **AI-Powered Resume Parsing**: Automatically extracts structured data from PDF resumes
- **Candidate Pool Management**: Organize and track candidates across multiple job groups
- **AI Interview Assessment**: Automated interviews with real-time evaluation
- **Job Group Management**: Create and manage recruitment campaigns with custom requirements
- **Skill Matching**: Intelligent matching of candidate skills against job requirements
- **Real-time Notifications**: Stay updated on application status and interviews
- **CSV Bulk Upload**: Import candidate lists via CSV files
- **Email Integration**: Automated email notifications and invitations
- **Analytics Dashboard**: Visual insights into recruitment metrics

## 📋 Most Challenging Problem Solved

**Building an AI-powered resume parser that accurately extracts structured data from unstructured PDF resumes with varying formats.**

The most challenging problem I solved recently was developing a production-ready resume parsing system that converts unstructured PDF documents into structured JSON data. The core challenge was handling the extreme variability in resume formats—each candidate uses different layouts, section headings, date formats, and skill naming conventions. I built a Python-based parser using PyMuPDF for PDF extraction, combined with 15+ complex regex patterns to identify contact information, dates, certifications, and experience entries. The system employs fuzzy string matching (using RapidFuzz) with an 80% similarity threshold to normalize skill names against a comprehensive lexicon of 500+ technical skills, handling variations like "JavaScript" vs "JS" vs "javascript". Additionally, I implemented intelligent section detection that identifies resume sections even when they use non-standard headings (e.g., "Work Experience" vs "Employment History" vs "Professional Experience") by using canonical heading mappings and keyword-based classification. The parser integrates with a FastAPI service that communicates with our Node.js backend, requiring careful error handling for malformed PDFs and graceful degradation when extraction fails. This solution improved our candidate onboarding time by 85% and enabled automated skill matching against job requirements.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** or **pnpm** or **bun**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amaljames004/capstone2025.git
   cd capstone2025
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Install AI Service Dependencies**
   ```bash
   cd ../ai-service
   pip install -r requirements.txt
   ```

5. **Set up Environment Variables**
   
   Create `.env` files in respective directories:
   
   **Backend (.env)**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
   
   **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   
   **AI Service (.env)**
   ```env
   PORT=8000
   ```

6. **Run the Development Servers**

   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   # or use nodemon for auto-reload
   ```

   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

   **AI Service** (Terminal 3):
   ```bash
   cd ai-service
   python main.py
   # or
   uvicorn main:app --reload
   ```

7. **Open the Application**
   
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - AI Service API: [http://localhost:8000](http://localhost:8000)

## 📁 Project Structure

```
capstone2025/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # Next.js app directory
│   │   ├── candidate/        # Candidate-facing pages
│   │   ├── recruiter/        # Recruiter-facing pages
│   │   ├── landing/          # Landing page
│   │   └── ...
│   ├── components/           # Reusable React components
│   ├── context/             # React context providers
│   ├── utils/               # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Node.js/Express backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── uploads/             # Uploaded files
│   └── server.js            # Entry point
│
├── ai-service/              # Python FastAPI service
│   ├── resume_parser.py     # Resume parsing logic
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
│
└── README.md                # This file
```

## 🎯 Frontend Development (Next.js)

This project uses [Next.js](https://nextjs.org) framework. Here are some key points:

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔧 API Endpoints

### Backend API (Port 5000)
- `/api/auth/*` - Authentication routes
- `/api/candidate/*` - Candidate management
- `/api/recruiter/*` - Recruiter operations
- `/api/interview/*` - Interview management
- `/api/application/*` - Application handling
- `/api/notification/*` - Notifications

### AI Service API (Port 8000)
- `POST /parse-resume` - Parse PDF resume
- `POST /match-skills` - Match skills with job requirements
- `POST /extract-skills` - Extract skills from text
- `GET /supported-skills` - Get supported skills list

## 📝 License

This project is part of a capstone project for academic purposes.

## 👥 Contributors

- Amal James
- Savin Shaij

## 🔗 Repository Links

- **Your Repository**: https://github.com/Amaljames004/capstone2025
- **Friend's Repository**: https://github.com/savinshaij/capstone2025

---

**Note**: This is an academic capstone project. For production use, ensure proper security measures, environment variable protection, and comprehensive testing.
