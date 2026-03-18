# Troubleshooting Guide

## Backend is Running ✅

Your backend is successfully running on `http://localhost:8000`. You can:
- View API docs: http://localhost:8000/docs
- Test endpoints directly in Swagger UI
- Use the backend API from any HTTP client

## Frontend Setup Issue: npm not found

### Problem
```
npm : The term 'npm' is not recognized
```

### Solution: Install Node.js

Node.js includes npm. Install it from:

**Option 1: Official Installer (Recommended)**
1. Visit: https://nodejs.org/
2. Download the LTS version (18.x or higher)
3. Run the installer
4. Restart your terminal/PowerShell
5. Verify: `node --version` and `npm --version`

**Option 2: Using Package Manager**

If you have Chocolatey:
```powershell
choco install nodejs
```

If you have winget:
```powershell
winget install OpenJS.NodeJS.LTS
```

**Option 3: Using Conda (since you're using conda base)**
```powershell
conda install -c conda-forge nodejs npm
```

### After Installing Node.js

1. Close and reopen your terminal
2. Verify installation:
   ```powershell
   node --version
   npm --version
   ```
3. Navigate to frontend:
   ```powershell
   cd frontend
   npm install
   npm run dev -- --port 5173
   ```

## Testing Backend Without Frontend

While setting up the frontend, you can test the backend:

1. **Swagger UI**: http://localhost:8000/docs
   - Interactive API testing
   - Try all endpoints
   - See request/response schemas

2. **Health Check**: http://localhost:8000/health
   - Should return: `{"status": "ok"}`

3. **Example: Create Closet Item** (using Swagger UI)
   - Go to `/closet/items` POST endpoint
   - Click "Try it out"
   - Enter JSON:
     ```json
     {
       "name": "Navy blazer",
       "category": "outerwear",
       "color": "navy",
       "formality": 4,
       "season": "all",
       "notes": "slim fit"
     }
     ```
   - Click "Execute"

## Common Issues

### Backend Port Already in Use
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### CORS Errors (when frontend connects)
- Ensure `CORS_ORIGINS=http://localhost:5173` in `backend/.env`
- Restart backend after changing `.env`

### Database Issues
- Delete `backend/data/app.db` to reset
- Run seed script: `python -m app.utils.seed`

### Python Virtual Environment Issues
```powershell
# If .venv activation fails
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .
```

