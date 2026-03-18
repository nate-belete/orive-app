# PowerShell script to start the backend server
# Usage: .\START_BACKEND.ps1

Write-Host "Activating virtual environment..." -ForegroundColor Cyan

if (Test-Path .\.venv\Scripts\Activate.ps1) {
    .\.venv\Scripts\Activate.ps1
    Write-Host "Virtual environment activated!" -ForegroundColor Green
    Write-Host "Starting backend server on http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Press CTRL+C to stop" -ForegroundColor Yellow
    Write-Host ""
    uvicorn app.main:app --reload --port 8000
} else {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run setup first:" -ForegroundColor Yellow
    Write-Host "  python -m venv .venv" -ForegroundColor White
    Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "  pip install -U pip" -ForegroundColor White
    Write-Host "  pip install -e ." -ForegroundColor White
}

