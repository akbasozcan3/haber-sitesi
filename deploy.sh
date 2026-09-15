#!/usr/bin/env bash
# WebHaber Production Deployment Script
# Usage: bash deploy.sh

set -e

echo "🚀 [1/5] Pulling latest changes..."
git pull origin main || true

echo "📦 [2/5] Deploying Backend (Laravel)..."
cd backend
composer install --optimize-autoloader --no-dev --no-interaction
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "🎨 [3/5] Deploying Frontend (Next.js)..."
cd ../frontend
npm ci --prefer-offline
npm run build

echo "🔄 [4/5] Restarting application processes with PM2..."
if command -v pm2 &> /dev/null; then
    pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
else
    echo "PM2 not found. Please start frontend with: npm start"
fi

echo "✅ [5/5] Deployment completed successfully!"
