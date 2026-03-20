# SkillSync

An AI-powered career platform that helps job seekers optimize their resumes, prepare for interviews, and improve their job application success rate through intelligent analysis and personalized coaching.

## Overview

SkillSync uses natural language processing and vector similarity search to analyze resumes against job descriptions, providing actionable insights and ATS compatibility scores. The platform includes resume parsing, keyword gap analysis, intelligent job matching, and personalized interview preparation tools.

## Key Features

### Resume Analysis & ATS Scoring

- Automated text extraction from PDF resumes
- ATS compatibility scoring (0-100) based on keyword matching, formatting, and readability
- Missing keyword detection comparing resume content against target job descriptions
- Detailed feedback on resume improvement areas

### Job Matching

- Vector similarity search using all-MiniLM-L6-v2 embeddings for semantic matching
- Gap analysis identifying specific skill and experience differences
- Actionable recommendations to align candidate profiles with role requirements

### Interview Preparation

- AI-generated interview questions tailored to resume content and job descriptions
- Technical, behavioral, and situational question categories
- Context-aware question generation based on candidate experience level

### Authentication & Security

- Complete authentication flow including signup, login, and password recovery
- JWT-based stateless authentication
- Password hashing with bcrypt
- Email integration via SMTP for password reset functionality

## Technical Architecture

### Frontend

- **Framework**: Next.js 14 with App Directory
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend

- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite (development) / PostgreSQL (production-ready via Supabase)
- **ORM**: SQLAlchemy
- **AI/ML Stack**:
  - Groq API for LLM inference
  - SentenceTransformers for embedding generation
  - FAISS for vector similarity search
- **Authentication**: OAuth2 with JWT tokens
- **Email**: SMTP integration for transactional emails

### Tech Stack Summary

| Component      | Technology                             |
| -------------- | -------------------------------------- |
| Frontend       | Next.js 14, TypeScript, Tailwind CSS   |
| Backend        | FastAPI, Python 3.10+                  |
| Database       | SQLite, PostgreSQL                     |
| AI Models      | LLaMA/Mixtral (Groq), all-MiniLM-L6-v2 |
| Storage        | Local filesystem                       |
| Authentication | JWT, bcrypt                            |

## Installation

### Prerequisites

- Node.js v18 or higher
- Python 3.10 or higher
- Git

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/skillsync.git
cd skillsync
```

2. **Backend setup**

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

The backend server will run at `http://localhost:8000`

3. **Frontend setup**

```bash
cd frontend
npm install
npm run dev
```

The frontend application will run at `http://localhost:3005`

## Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Required environment variables:

- `GROQ_API_KEY`: API key for Groq Cloud (required for AI features)
- `SECRET_KEY`: Secret key for JWT token encryption (change from default)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token expiration time (default: 30)
- `SMTP_SERVER`: SMTP server hostname (default: smtp.gmail.com, optional for local dev)
- `SMTP_PORT`: SMTP server port (default: 587, optional for local dev)
- `SMTP_USER`: SMTP authentication username (optional for local dev)
- `SMTP_PASSWORD`: SMTP authentication password (optional for local dev)
- `FROM_EMAIL`: Sender email address for password reset emails (optional for local dev)
- `DATABASE_URL`: Database connection string (defaults to SQLite if not specified)

### Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8000/api/v1`)

## Project Structure

```
skillsync/
├── backend/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── core/         # Configuration and security
│   │   ├── db/           # Database session and base
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic and AI services
│   │   ├── utils/        # Utility functions
│   │   └── vectorstore/  # FAISS vector store management
│   ├── uploads/          # Resume file storage
│   └── requirements.txt
│
└── frontend/
    ├── app/              # Next.js pages (App Router)
    ├── components/       # React components
    ├── services/         # API client services
    └── utils/            # Utility functions
```

## API Documentation

Once the backend is running, access the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Code Quality

The project uses ESLint for JavaScript/TypeScript linting and follows PEP 8 guidelines for Python code.
