#!/bin/bash

# Deployment script for STT/TTS/LLM Testing Playground
# This script handles docker buildx compatibility issues

set -e

echo "🚀 Starting deployment of STT/TTS/LLM Testing Playground..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and add your API keys:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Pull latest changes if git repo
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull
fi

# Build backend image using classic docker build
echo "🔨 Building backend image (this may take a few minutes)..."
docker build -t test-stt-tts-backend:latest ./backend

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Access the application at:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo "   Health:   http://localhost:3001/api/health"
    echo ""
    echo "📊 View logs with:"
    echo "   docker-compose logs -f"
else
    echo "❌ Deployment failed. Check logs:"
    echo "   docker-compose logs"
    exit 1
fi
