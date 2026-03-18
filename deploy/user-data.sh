#!/bin/bash
set -ex

# Install system dependencies
dnf update -y
dnf install -y python3.11 python3.11-pip nginx git nodejs npm

# Create app user
useradd -m -s /bin/bash orive

# Clone the repo (public-read via deploy key or HTTPS)
cd /home/orive
sudo -u orive git clone https://github.com/nate-belete/orive-app.git app
cd app

# --- Backend setup ---
cd backend
sudo -u orive python3.11 -m venv .venv
sudo -u orive .venv/bin/pip install --upgrade pip
sudo -u orive .venv/bin/pip install -e .

# Create .env
cat > .env << 'ENVEOF'
APP_ENV=production
DATABASE_URL=sqlite:///./data/app.db
CORS_ORIGINS=*
JWT_SECRET_KEY=$(openssl rand -hex 32)
AI_MODE=mock
ENVEOF
chown orive:orive .env

# Create data directory
sudo -u orive mkdir -p data/uploads

cd /home/orive/app

# --- Frontend setup ---
cd frontend

# Create .env.local pointing to backend via nginx proxy
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=
ENVEOF
chown orive:orive .env.local

sudo -u orive npm install
sudo -u orive npm run build

cd /home/orive/app

# --- Nginx config ---
cat > /etc/nginx/conf.d/orive.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 20M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /auth/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /closet/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /occasions/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /playbooks/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /feedback/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /colour/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /health {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /openapi.json {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINXEOF

# Remove default nginx config
rm -f /etc/nginx/conf.d/default.conf

# --- Systemd services ---

# Backend service
cat > /etc/systemd/system/orive-backend.service << 'SVCEOF'
[Unit]
Description=Orive Backend API
After=network.target

[Service]
User=orive
WorkingDirectory=/home/orive/app/backend
ExecStart=/home/orive/app/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5
Environment=PATH=/home/orive/app/backend/.venv/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
SVCEOF

# Frontend service
cat > /etc/systemd/system/orive-frontend.service << 'SVCEOF'
[Unit]
Description=Orive Frontend
After=network.target

[Service]
User=orive
WorkingDirectory=/home/orive/app/frontend
ExecStart=/usr/bin/npx next start -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

# Start everything
systemctl daemon-reload
systemctl enable --now orive-backend
systemctl enable --now orive-frontend
systemctl enable --now nginx

echo "=== Orive deployment complete ==="
