#!/bin/bash

# Seller Dashboard - Vercel Deployment Script
# This script helps you deploy the application to Vercel

set -e  # Exit on error

echo "🚀 Seller Dashboard - Vercel Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Check if user is logged in
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Please login to Vercel:"
    vercel login
else
    echo -e "${GREEN}✅ Logged in to Vercel as: $(vercel whoami)${NC}"
fi
echo ""

# Ask for deployment type
echo "Select deployment type:"
echo "1) Production deployment"
echo "2) Preview deployment (for testing)"
read -p "Enter choice (1 or 2): " deploy_type

if [ "$deploy_type" = "1" ]; then
    DEPLOY_FLAG="--prod"
    DEPLOY_TYPE="production"
else
    DEPLOY_FLAG=""
    DEPLOY_TYPE="preview"
fi

echo ""
echo -e "${YELLOW}📋 Pre-deployment checklist:${NC}"
echo ""

# Check for .env.local
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "   You'll need to set environment variables in Vercel dashboard"
fi

# Check for required environment variables
echo ""
echo -e "${YELLOW}Required environment variables for Vercel:${NC}"
echo "  - NEXT_PUBLIC_SELLER_API_BASE_URL (your backend API URL)"
echo "  - JWT_SECRET (min 32 characters)"
echo "  - JWT_REFRESH_SECRET (min 32 characters)"
echo ""

read -p "Have you set these environment variables in Vercel dashboard? (y/n): " env_set

if [ "$env_set" != "y" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Please set environment variables first:${NC}"
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select your project (or it will be created on first deploy)"
    echo "3. Go to Settings → Environment Variables"
    echo "4. Add the required variables"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

echo ""
echo -e "${YELLOW}🔨 Building application...${NC}"

# Run build to check for errors
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Deploying to Vercel ($DEPLOY_TYPE)...${NC}"
echo ""

# Deploy to Vercel
if [ "$deploy_type" = "1" ]; then
    vercel --prod
else
    vercel
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Test your deployment URL"
echo "2. Verify backend API connection"
echo "3. Test authentication flow"
echo "4. Check all features work correctly"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"