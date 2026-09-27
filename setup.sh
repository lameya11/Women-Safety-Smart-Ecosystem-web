#!/bin/bash
# SafeGuard Quick Start Script (Linux/macOS)

echo "=========================================="
echo " SafeGuard - Women Safety Smart Ecosystem"
echo " Quick Start Script"
echo "=========================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Install from https://nodejs.org"
    exit 1
fi
echo "[OK] Node.js: $(node --version)"

# Backend setup
echo ""
echo "[1/2] Setting up backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] Created backend/.env — please edit JWT_SECRET"
fi
npm install && echo "[OK] Backend dependencies installed"

# Frontend setup
echo ""
echo "[2/2] Setting up frontend..."
cd ../frontend
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local 2>/dev/null || echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
    echo "[OK] Created frontend/.env.local"
fi
npm install && echo "[OK] Frontend dependencies installed"

echo ""
echo "=========================================="
echo "Setup complete!"
echo ""
echo "Run backend:  cd backend && npm run dev"
echo "Run frontend: cd frontend && npm start"
echo ""
echo "App URL: http://localhost:3000"
echo "Demo:    demo@safeguard.app / demo123456"
echo "=========================================="
