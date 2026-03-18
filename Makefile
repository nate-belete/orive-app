.PHONY: help backend-setup backend-run frontend-setup frontend-run seed openapi

help:
	@echo "Occasion OS POC - Available commands:"
	@echo "  make backend-setup  - Setup Python virtual environment and install dependencies"
	@echo "  make backend-run    - Run the FastAPI backend server"
	@echo "  make frontend-setup - Install frontend dependencies"
	@echo "  make frontend-run   - Run the Vite development server"
	@echo "  make seed           - Seed the database with sample closet items"
	@echo "  make openapi        - Generate OpenAPI contract from backend"

backend-setup:
	cd backend && python -m venv .venv
	cd backend && .venv/Scripts/activate && pip install -U pip && pip install -e .
	@echo "Backend setup complete. Don't forget to copy backend/.env.example to backend/.env"

backend-run:
	cd backend && .venv/Scripts/activate && uvicorn app.main:app --reload --port 8000

frontend-setup:
	cd frontend && npm install

frontend-run:
	cd frontend && npm run dev -- --port 5173

seed:
	cd backend && .venv/Scripts/activate && python -m app.utils.seed

openapi:
	@echo "Generating OpenAPI contract..."
	@cd backend && .venv/Scripts/activate && python scripts/generate_openapi.py || echo "Note: Make sure backend dependencies are installed"

