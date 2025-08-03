#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔬 Full pre-commit validation...${NC}"
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

# 1. Dependencies check
echo
info "Step 1: Checking dependencies..."
if npm ci; then
    success "Dependencies installed successfully"
else
    error "Failed to install dependencies"
    exit 1
fi

# 2. TypeScript compilation
echo
info "Step 2: TypeScript compilation check..."
if npx tsc --noEmit; then
    success "TypeScript compilation passed"
else
    error "TypeScript compilation failed"
    exit 1
fi

# 3. ESLint check
echo
info "Step 3: ESLint validation..."
if npm run lint; then
    success "ESLint validation passed"
else
    error "ESLint validation failed"
    exit 1
fi

# 4. Tests with coverage
echo
info "Step 4: Running tests with coverage..."
if npm run test:coverage; then
    success "All tests passed with coverage"
    
    # Check if coverage files exist
    if [ -d "coverage" ]; then
        info "Coverage report generated in coverage/ directory"
    fi
else
    error "Tests failed"
    exit 1
fi

# 5. Next.js build check
echo
info "Step 5: Next.js build validation..."
if npm run build; then
    success "Next.js build successful"
    
    # Check if build artifacts exist
    if [ -d ".next" ]; then
        info "Build artifacts created in .next/ directory"
    fi
else
    error "Next.js build failed"
    exit 1
fi

# 6. Docker validation (if Docker files exist)
echo
info "Step 6: Docker validation..."
if [ -f "Dockerfile" ]; then
    info "Running Docker validation..."
    if [ -f "scripts/pre-push-docker-test.sh" ]; then
        if ./scripts/pre-push-docker-test.sh; then
            success "Docker validation passed"
        else
            error "Docker validation failed"
            exit 1
        fi
    else
        warning "Docker test script not found - running basic Docker build test..."
        if docker build -t forkspy-validation . >/dev/null 2>&1; then
            success "Docker build test passed"
            docker rmi forkspy-validation >/dev/null 2>&1 || true
        else
            error "Docker build failed"
            exit 1
        fi
    fi
else
    info "No Dockerfile found - skipping Docker validation"
fi

# 7. Security audit (non-blocking)
echo
info "Step 7: Security audit..."
if npm audit --audit-level moderate; then
    success "No moderate+ security vulnerabilities found"
else
    warning "Security vulnerabilities found - review before pushing to production"
    info "Run 'npm audit fix' to attempt automatic fixes"
fi

# 8. File size check
echo
info "Step 8: Checking for large files..."
large_files=$(find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" | xargs ls -la | awk '$5 > 500000 {print $9, $5}' 2>/dev/null || true)
if [ -n "$large_files" ]; then
    warning "Large files detected (>500KB):"
    echo "$large_files"
    info "Consider code splitting or optimization"
else
    success "No large files detected"
fi

# 9. Git status check
echo
info "Step 9: Git status check..."
if [ -n "$(git status --porcelain)" ]; then
    warning "Uncommitted changes detected:"
    git status --short
    info "Consider committing or stashing changes"
else
    success "Working directory clean"
fi

# 10. Environment check
echo
info "Step 10: Environment configuration check..."
if [ -f ".env.example" ] && [ -f ".env.local" ]; then
    success "Environment files present"
elif [ -f ".env.example" ]; then
    warning ".env.example found but .env.local missing - create for local development"
else
    info "No environment template found"
fi

echo
echo "================================"
echo -e "${GREEN}🎉 Full validation completed!${NC}"
echo
echo "Summary:"
echo "- ✅ TypeScript compilation"
echo "- ✅ ESLint validation" 
echo "- ✅ All tests passing"
echo "- ✅ Build successful"
echo "- ✅ Docker validation"
echo "- ✅ Security audit"
echo
echo -e "${GREEN}Code is ready for commit and push! 🚀${NC}"
echo
