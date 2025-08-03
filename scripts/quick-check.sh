#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quick pre-push validation...${NC}"
echo "================================"

# Function to print success messages
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print info messages
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to print warning messages
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error messages
error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. TypeScript check
echo
info "Step 1: Checking TypeScript compilation..."
if npx tsc --noEmit; then
    success "TypeScript check passed"
else
    error "TypeScript errors found - fix before pushing"
    exit 1
fi

# 2. ESLint check
echo
info "Step 2: Running ESLint..."
if npm run lint; then
    success "ESLint check passed"
else
    error "ESLint errors found - fix before pushing"
    exit 1
fi

# 3. Quick test run
echo
info "Step 3: Running tests..."
if npm test; then
    success "All tests passed"
else
    error "Tests failed - fix before pushing"
    exit 1
fi

# 4. Check if Docker files changed
echo
info "Step 4: Checking for Docker changes..."
if git diff --cached --name-only 2>/dev/null | grep -q "Dockerfile\|docker-compose\|healthcheck\|\.dockerignore" || \
   git diff HEAD~1 --name-only 2>/dev/null | grep -q "Dockerfile\|docker-compose\|healthcheck\|\.dockerignore"; then
    warning "Docker files changed - running quick Docker build test..."
    
    if docker build --target test -t forkspy-quick-test . >/dev/null 2>&1; then
        success "Docker test build passed"
        docker rmi forkspy-quick-test >/dev/null 2>&1 || true
    else
        error "Docker build failed - run full Docker validation"
        exit 1
    fi
    
    if docker build -t forkspy-quick-prod . >/dev/null 2>&1; then
        success "Docker production build passed"
        docker rmi forkspy-quick-prod >/dev/null 2>&1 || true
    else
        error "Docker production build failed"
        exit 1
    fi
else
    info "No Docker changes detected - skipping Docker build test"
fi

# 5. Check for common issues
echo
info "Step 5: Checking for common issues..."

# Check for console.log statements in production code
if grep -r "console\.log\|console\.error\|console\.warn" app/ components/ lib/ hooks/ 2>/dev/null | grep -v test | grep -v "\.test\." | head -5; then
    warning "Found console statements in production code - consider removing"
else
    success "No console statements in production code"
fi

# Check for TODO/FIXME comments
if grep -r "TODO\|FIXME\|XXX\|HACK" app/ components/ lib/ hooks/ 2>/dev/null | head -3; then
    warning "Found TODO/FIXME comments - review before pushing"
else
    success "No TODO/FIXME comments found"
fi

echo
echo "================================"
echo -e "${GREEN}✅ Quick validation passed! Safe to push.${NC}"
echo
info "If you made Docker changes, consider running: ./scripts/pre-push-docker-test.sh"
echo
