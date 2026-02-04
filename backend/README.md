# SkillSync Backend

FastAPI backend for SkillSync.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Structure

- `app/api`: API route handlers
- `app/core`: Application configuration
- `app/services`: Business logic and services
- `app/models`: Database models
- `app/schemas`: Pydantic schemas
- `app/db`: Database connection and session
