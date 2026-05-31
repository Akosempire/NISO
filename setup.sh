#!/bin/bash

# NISO Local Development Setup Script
# Run this once to set up the complete dev environment

set -e

echo "=== NISO Development Setup ==="
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker required but not installed. Aborting." >&2; exit 1; }

echo "✓ Node.js: $(node --version)"
echo "✓ Docker: $(docker --version)"
echo ""

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker run -d \
  --name niso-db \
  -e POSTGRES_USER=niso \
  -e POSTGRES_PASSWORD=niso_dev_pw \
  -e POSTGRES_DB=niso \
  -p 5432:5432 \
  postgres:14 2>/dev/null || docker start niso-db

echo "✓ PostgreSQL running on localhost:5432"
sleep 3

# Setup backend
echo ""
echo "Setting up backend..."
cd backend

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ Created .env"
fi

echo "DATABASE_URL=postgresql://niso:niso_dev_pw@localhost:5432/niso" >> .env

npm install --silent
echo "✓ Dependencies installed"

npx prisma generate --silent
npx prisma migrate deploy --silent
npx prisma db seed --silent
echo "✓ Database initialized"

cd ..

# Setup frontend
echo ""
echo "Setting up frontend..."
cd frontend

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ Created .env"
fi

npm install --silent
echo "✓ Dependencies installed"

cd ..

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Start development servers:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Access:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Demo Login:"
echo "  Email:    operator@station.ng"
echo "  Password: password123"
echo ""
