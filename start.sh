#!/bin/bash

echo "🚀 AI Task Planner - Quick Start"
echo "================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local found."
    echo "   Creating from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "   Please edit .env.local and add your MIMO_API_KEY"
    echo "   Then run this script again."
    echo ""
    exit 1
fi

# Check if MIMO_API_KEY is set
if grep -q "your_mimo_api_key_here" .env.local; then
    echo "⚠️  MIMO_API_KEY not configured in .env.local"
    echo ""
    echo "   Please edit .env.local and replace 'your_mimo_api_key_here'"
    echo "   with your actual Mimo API key."
    echo ""
    echo "   You can still use the app without AI features."
    echo ""
fi

echo "Starting development server..."
echo ""
echo "📍 Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
