# SkillSync 🚀
> **Your AI-Powered Career Coach & Resume Intelligence Suite.**

![SkillSync Banner](https://via.placeholder.com/1200x400.png?text=SkillSync+AI+Career+Coach)
*(Replace with actual screenshot/banner)*

SkillSync is a comprehensive, AI-driven platform designed to supercharge your job search. By leveraging **LLMs (Large Language Models)**, **Vector Search**, and **ATS (Applicant Tracking System) Simulation**, SkillSync helps candidates optimize their resumes, prepare for interviews, and land their dream jobs faster.

Built with meaningful automation and a user-first design philosophy.

---

## 🌟 Key Features

### 🧠 1. Smart Resume Analysis & ATS Scoring
- **Automated Parsing**: Extracts text from PDF resumes accurately.
- **ATS Simulation**: Scores your resume (0-100) based on keyword matching, formatting, and readability.
- **Missing Keyword Detection**: Identifies critical skills missing from your resume compared to a target Job Description (JD).

### 🎯 2. Intelligent Job Matching
- **Vector Similarity Search**: Uses `all-MiniLM-L6-v2` embeddings to semantically match your resume against provided JDs.
- **Gap Analysis**: Provides specific, actionable feedback on how to bridge the gap between your profile and the role requirements.

### 🎙️ 3. Personalized Interview Coach
- **AI Question Generator**: Generates tailored technical, behavioral, and situational interview questions based on your specific resume content and the JD.
- **Role-Playing**: (Planned) Interactive mock interview sessions.

### 🔒 4. Secure Authentication
- **Full Auth Suite**: Sign up, Login, Forgot Password, and Reset Password flows.
- **Email Integration**: Real SMTP email dispatch for password recovery (via Gmail).
- **Security**: JWT-based stateless authentication with password hashing (Bcrypt).

---

## 🏗️ Architecture

SkillSync follows a modern **Client-Server** architecture:

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Directory)
  - **Styling**: Tailwind CSS for responsive, pixel-perfect UI.
  - **Icons**: Lucide React.
  - **State**: React Hooks & Context API.

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
  - **Database**: SQLite (Dev) / PostgreSQL (Supabase Ready).
  - **ORM**: SQLAlchemy.
  - **AI/ML**:
    - `Groq API` (LLM inference for coaching/analysis).
    - `SentenceTransformers` (Embeddings).
    - `FAISS` (Vector Store for efficient similarity search).
  - **Auth**: OAuth2 with JWT.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Axios |
| **Backend** | FastAPI, Python, Pydantic, Uvicorn |
| **Database** | SQLite (Local), PostgreSQL (Supabase) |
| **AI Models** | LLaMA / Mixtral (via Groq), all-MiniLM-L6-v2 |
| **Storage** | Local FS (Uploads) |
| **Auth** | JWT, bcrypt, python-multipart |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/skillsync.git
cd skillsync
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```
*Backend runs on `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3005` (or 3000)*

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
Copy the example file:
```bash
cp .env.example .env
```
Fill in the following keys:
- `GROQ_API_KEY`: Your Groq Cloud API Key.
- `SMTP_*`: Settings for email sending (optional for local dev).
- `DATABASE_URL`: Connection string (auto-defaults to SQLite if left empty).

### Frontend (`frontend/.env.local`)
Copy the example file:
```bash
cp .env.example .env.local
```
- `NEXT_PUBLIC_API_URL`: `http://localhost:8000/api/v1`

---

## 📦 Project Structure

```
skillsync/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config & Security
│   │   ├── db/           # Database session & Base
│   │   ├── models/       # SQLAlchemy Models
│   │   ├── schemas/      # Pydantic Schemas
│   │   └── services/     # Business Logic (AI, Resume, Email)
│   ├── uploads/          # Local resume storage
│   └── requirements.txt
│
└── frontend/
    ├── app/              # Next.js App Router Pages
    ├── components/       # Reusable UI Components
    ├── services/         # API Client (Axios)
    └── public/           # Static assets
```

---

## 🔮 Future Roadmap
- [ ] **Cloud Storage**: Migrate file uploads to AWS S3 / Supabase Storage.
- [ ] **React Native App**: Mobile version for on-the-go prep.
- [ ] **Mock Interviews**: Voice-to-text integration for real-time answers.
- [ ] **Job Board**: Scrape and aggregate relevant listings.

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a PR.

1. Fork the repo.
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Crafted with ❤️ by the SkillSync Team.**
