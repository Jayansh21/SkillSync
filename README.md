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

## Getting Started & Installation

### Option 1: Quick Start with Docker (Recommended)

The easiest way to run the entire SkillSync stack (Frontend & Backend) is using Docker Compose.

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

#### Run Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillsync.git
   cd skillsync
   ```

2. **Set up Environment Variables**
   Create a `.env` file in the `backend/` directory and `.env.local` in `frontend/` directory (see [Configuration](#configuration) below).

3. **Start the Application**
   ```bash
   docker-compose up --build
   ```
   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

---

### Option 2: Manual Local Installation

If you prefer to run the components directly on your host machine:

#### Prerequisites
- Node.js v18 or higher
- Python 3.11 or higher
- Git

#### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillsync.git
   cd skillsync
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv

   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate

   # Install dependencies (CPU-optimized PyTorch is recommended for light weight)
   pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

   # Start the server
   uvicorn app.main:app --reload
   ```
   The backend server will run at `http://localhost:8000`.

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   The frontend application will run at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is taken).

---

## Configuration

### Backend Environment Variables (`backend/.env`)

Create a `.env` file in the `backend/` directory by copying `.env.example`:
```bash
cp backend/.env.example backend/.env
```

| Key | Description | Default / Example |
|---|---|---|
| `GROQ_API_KEY` | API key for Groq Cloud (LLM inference) | `gsk_...` |
| `SECRET_KEY` | Secret key for JWT encryption | `changethis` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry in minutes | `11520` (8 days) |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `DATABASE_URL` | SQLAlchemy Connection URI | `sqlite:///./sql_app.db` or PostgreSQL |
| `SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Supabase Anon/Public Key | `your-anon-key` |
| `SUPABASE_JWT_SECRET` | Supabase JWT Secret (for JWT validations) | `your-jwt-secret` |

### Frontend Environment Variables (`frontend/.env.local`)

Create a `.env.local` file in the `frontend/` directory by copying `.env.example`:
```bash
cp frontend/.env.example frontend/.env.local
```

| Key | Description | Default / Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API Endpoint URL | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `your-anon-key` |

---

## Production Cloud Deployment (Free Tier Stack)

SkillSync is structured to run entirely on free-tier cloud infrastructure:
1. **Frontend**: [Vercel](https://vercel.com/)
2. **Backend**: [Hugging Face Spaces](https://huggingface.co/spaces) (Docker space)
3. **Database / Auth / Storage**: [Supabase](https://supabase.com/)

### Step 1: Database, Auth & Storage (Supabase)
1. Create a free project on Supabase.
2. Under **Storage**, create a **public** bucket named `resumes`.
3. In **Database > SQL Editor**, run the migrations or schemas to create the necessary tables (`users`, `resumes`, `jobs`).
4. Gather your Project URL, Anon Key, and JWT secret from **Project Settings > API**.

### Step 2: Backend Deployment (Hugging Face Spaces)
1. Create a new **Space** on Hugging Face.
2. Select **Docker** as the SDK, and choose the **Blank** template.
3. In your Space's **Settings**, add the required Environment Secrets:
   - `GROQ_API_KEY`
   - `DATABASE_URL` (your Supabase transaction pooler or session pooler URL)
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `BACKEND_CORS_ORIGINS` (your Vercel frontend URL)
4. Commit/Push the contents of the `backend/` directory to the Space repository. Hugging Face will build the Docker container and host the API.

> [!NOTE]
> **Stateless FAISS Index Recovery**: On Space startup, the backend automatically reads all existing resume documents from Supabase Postgres, generates semantic embeddings using PyTorch/SentenceTransformers, and rebuilds the local memory-efficient FAISS index. This ensures the vector store is fully stateless and self-healing across container restarts!

### Step 3: Frontend Deployment (Vercel)
1. Import the project repository into Vercel.
2. Set the root directory of the project to `frontend/`.
3. Configure the **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` (pointing to your Hugging Face Space URL ending in `/api/v1`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

---

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
│   ├── requirements.txt  # Python requirements (CPU PyTorch optimized)
│   └── Dockerfile        # Backend multi-stage build file
│
├── frontend/
│   ├── app/              # Next.js App Router (pages and layouts)
│   ├── components/       # UI Components
│   ├── services/         # API client handlers
│   ├── utils/            # Supabase client and utils
│   └── Dockerfile        # Next.js multi-stage build file
│
└── docker-compose.yml    # Main compose file for local orchestration
```

## API Documentation

When the backend is running, you can access the interactive Swagger API documentation at:
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`

## Development & Quality

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality
The project uses ESLint for JavaScript/TypeScript and follows PEP 8 guidelines for Python.

