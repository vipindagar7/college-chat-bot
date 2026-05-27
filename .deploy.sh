#!/bin/bash

set -e

echo "========================================"
echo "🤖 STARTING CHATBOT DEPLOYMENT"
echo "========================================"

# ───────────────── PULL LATEST CODE ─────────────────

echo ""
echo "📥 Pulling latest code..."
echo ""

cd /home/college-chat-bot

git pull origin main

# ───────────────── BACKEND ─────────────────

echo ""
echo "📦 Installing backend dependencies..."
echo ""

cd server

npm install

echo ""
echo "♻ Restarting chatbot backend..."
echo ""

pm2 restart chatbot-api

# ───────────────── FRONTEND ─────────────────

echo ""
echo "🎨 Building frontend..."
echo ""

cd ../client

npm install

npm run build

# ───────────────── NGINX ─────────────────

echo ""
echo "🌐 Testing nginx..."
echo ""

sudo nginx -t

echo ""
echo "♻ Restarting nginx..."
echo ""

sudo systemctl restart nginx

echo ""
echo "========================================"
echo "✅ CHATBOT DEPLOYED SUCCESSFULLY"
echo "========================================"
