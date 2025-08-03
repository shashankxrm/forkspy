#!/bin/bash
set -e  # Exit on any error

echo "🐳 Running pre-push Docker tests..."
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print success messages
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print info messages
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to print error messages
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Cleanup function
cleanup() {
    info "Cleaning up test containers..."
    docker stop quick-test 2>/dev/null || true
    docker rm quick-test 2>/dev/null || true
    docker stop test-run 2>/dev/null || true
    docker rm test-run 2>/dev/null || true
    info "Cleanup complete"
}

# Set trap to cleanup on exit
trap cleanup EXIT

echo
info "Step 1: Building test image..."
if docker build --target test -t forkspy-test:latest .; then
    success "Test build successful"
else
    error "Test build failed"
    exit 1
fi

echo
info "Step 2: Running tests in container..."
if docker run --name test-run \
    -e NODE_ENV=test \
    -e MONGODB_URI=mongodb://localhost:27017/forkspy-test \
    -e GITHUB_CLIENT_ID=test_client_id \
    -e GITHUB_CLIENT_SECRET=test_client_secret \
    -e NEXTAUTH_SECRET=test_secret_for_testing_only \
    -e NEXTAUTH_URL=http://localhost:3001 \
    -e RESEND_API_KEY=test_resend_key \
    -e NEXT_PUBLIC_APP_URL=http://localhost:3001 \
    forkspy-test:latest; then
    success "Container tests passed"
else
    error "Container tests failed"
    info "Check test logs above for details"
    exit 1
fi

echo
info "Step 3: Building production image..."
if docker build -t forkspy-prod:latest .; then
    success "Production build successful"
else
    error "Production build failed"
    exit 1
fi

echo
info "Step 4: Testing production container startup..."
if docker run -d --name quick-test \
    -e NODE_ENV=production \
    -e NEXTAUTH_SECRET=test_secret \
    -e NEXTAUTH_URL=http://localhost:3001 \
    -e GITHUB_CLIENT_ID=test_client \
    -e GITHUB_CLIENT_SECRET=test_secret \
    -e MONGODB_URI=mongodb://localhost:27017/test \
    -e RESEND_API_KEY=test_key \
    -p 3005:3000 \
    forkspy-prod:latest; then
    success "Production container started"
else
    error "Production container failed to start"
    exit 1
fi

echo
info "Step 5: Waiting for application startup..."
sleep 15
success "Startup wait complete"

echo
info "Step 6: Testing health check..."
if docker exec quick-test node healthcheck.mjs; then
    success "Health check successful"
else
    error "Health check failed"
    info "Container logs:"
    docker logs quick-test --tail 20
    exit 1
fi

echo
info "Step 7: Testing external health endpoint..."
if timeout 10 bash -c 'until curl -f http://localhost:3005/api/health &>/dev/null; do sleep 1; done'; then
    success "External health endpoint accessible"
else
    error "External health endpoint failed"
    info "Make sure port 3005 is available"
    exit 1
fi

echo
info "Step 8: Cleaning up images..."
docker image prune -f &>/dev/null || true
success "Image cleanup complete"

echo
echo "======================================="
echo -e "${GREEN}🎉 All Docker tests passed! Ready to push.${NC}"
echo "======================================="

# Optional: Show image sizes
echo
info "Docker images created:"
docker images | grep forkspy | head -3
