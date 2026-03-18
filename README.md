# Occasion OS POC

A proof-of-concept application for personalized occasion styling. Users create occasions, manage their closet, and receive AI-generated playbooks with outfit recommendations, prep timelines, and presence coaching.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React + TypeScript, TanStack Query, Tailwind CSS
- **Backend**: Python 3.11+, FastAPI, SQLModel (SQLite), Pydantic
- **AI**: Mock generator (default) or optional LLM mode (OpenAI-compatible)

## Prerequisites

- Python 3.11 or higher
- Node.js 18+ and npm (see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if npm is not found)
- Make (optional, or use commands directly)

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# On macOS/Linux:
source .venv/bin/activate

pip install -U pip
pip install -e .
cp .env.example .env
```

Edit `backend/.env` if needed (defaults work for local development).

### 2. Run Backend

**Windows (PowerShell):**
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Or use the helper script:**
```powershell
cd backend
.\START_BACKEND.ps1
```

**macOS/Linux:**
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Note:** You must activate the virtual environment first! If you see "uvicorn is not recognized", you haven't activated the venv.

Backend will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173` (Next.js default port)

## Using Makefile (Optional)

```bash
make backend-setup   # Setup backend
make backend-run     # Run backend
make frontend-setup  # Setup frontend
make frontend-run    # Run frontend
make seed            # Seed sample closet items
```

## Project Structure

```
occasion-os-poc/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # SQLModel models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # Database operations
│   │   ├── routers/         # API routes
│   │   ├── ai/              # Playbook generation
│   │   └── utils/           # Seed script
│   ├── data/                # SQLite DB (created at runtime)
│   └── pyproject.toml
├── frontend/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Home page
│   │   ├── closet/          # Closet pages
│   │   ├── occasions/       # Occasion pages
│   │   ├── playbooks/       # Playbook pages
│   │   ├── feedback/        # Feedback pages
│   │   ├── history/         # History page
│   │   └── components/      # Reusable components
│   ├── lib/
│   │   └── api/             # API client & hooks
│   └── package.json
├── contracts/               # OpenAPI contract (generated)
└── README.md
```

## Features

### Closet Management
- Add items manually (name, category, color, formality, season, notes)
- View all items
- Delete items

### Occasion Creation
- Create occasions with type, date/time, location, dress code, weather hint
- Set comfort level and desired outcome

### Playbook Generation
- Automatically generates 3 outfit options
- Prep timeline (day before, morning of, pack list)
- Presence coaching (tips and scripts)
- Beauty notes
- Mock mode by default; LLM mode via `AI_MODE=llm` in `.env`

### Feedback Loop
- Submit post-event feedback
- Rate confidence (1-5)
- Track if outfit was worn and if you'd repeat it

### History
- View all occasions
- See associated feedback
- Navigate to playbooks

## Environment Variables

### Backend (`backend/.env`)

```env
APP_ENV=local
DATABASE_URL=sqlite:///./data/app.db
CORS_ORIGINS=http://localhost:5173

# AI mode: "mock" or "llm"
AI_MODE=mock

# Optional if AI_MODE=llm
LLM_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

## API Endpoints

- `GET /health` - Health check
- `GET /closet/items` - List closet items
- `POST /closet/items` - Create closet item
- `GET /occasions` - List occasions
- `POST /occasions` - Create occasion
- `POST /playbooks/generate?force=false` - Generate playbook
- `GET /playbooks/occasion/{id}` - Get playbook by occasion
- `POST /feedback` - Submit feedback
- `GET /feedback` - List all feedback

See `http://localhost:8000/docs` for full API documentation.

## Seeding Sample Data

```bash
cd backend
.venv\Scripts\activate  # Windows
python -m app.utils.seed
```

This adds sample closet items (navy blazer, white shirt, etc.) to get started.

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed troubleshooting guide.

### CORS Errors
- Ensure `CORS_ORIGINS` in `backend/.env` includes `http://localhost:5173`
- Restart backend after changing `.env`

### Port Already in Use
- Backend: Change port in `uvicorn` command or `.env`
- Frontend: Change port in `vite.config.ts` or `npm run dev -- --port <port>`

### Database Issues
- Delete `backend/data/app.db` to reset
- Run `python -m app.utils.seed` to add sample data

### Frontend Can't Connect to Backend
- Verify backend is running on port 8000
- Check `frontend/src/api/client.ts` baseURL matches backend
- Check browser console for errors

## Development Notes

- Backend uses SQLite for simplicity (no external DB required)
- Mock AI generator always produces consistent structure
- LLM mode falls back to mock if API key missing or on error
- Playbooks are stored as JSON strings in database
- Frontend uses React Query for caching and state management

## Next Steps (Optional Enhancements)

- Image upload for closet items
- "Select outfit worn" in feedback (choose outfit index)
- Risk flags rendering with icons
- Force regenerate button (already implemented via `?force=true`)

