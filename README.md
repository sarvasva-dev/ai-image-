# Aetheria AI Image Studio

Full stack AI image synthesis application featuring:

- **Backend**: FastAPI (Python 3.10) with multi-tier generative fallback pipeline (Local SD / Pollinations AI Cloud / Procedural)
- **Frontend**: React + Vite + Framer Motion (Glassmorphism design system)
- **Database**: SQLite / SQLAlchemy
- **Deployment**: Native Render Blueprint (`render.yaml`) support

---

## Local Development

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Web Studio: `http://localhost:5173`

---

## Deployment on Render (as Blueprint)

1. Connect your repository to [Render](https://render.com).
2. Create a new **Blueprint Instance** on Render.
3. Select this repository. Render will automatically read `render.yaml` and set up both services:
   - `ai-image-studio-backend` (Web Service)
   - `ai-image-studio-frontend` (Static Site)
4. Click **Deploy**. Both services will build and link automatically!

---

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── render.yaml
```