# 🐳 Docker Local Testing Guide

This guide helps you test all Docker functionality locally before pushing to avoid CI/CD failures.

## 📋 Pre-Push Testing Checklist

Run these commands in order to replicate the CI/CD pipeline locally:

### 1. 🧪 **Docker Test Stage** (Replicates `docker-test` job)

```bash
# Build test image
docker build --target test -t forkspy-test:latest .

# Verify test image exists
docker images forkspy-test:latest

# Run tests in Docker container
docker run --name test-run \
  -e NODE_ENV=test \
  -e MONGODB_URI=mongodb://localhost:27017/forkspy-test \
  -e GITHUB_CLIENT_ID=test_client_id \
  -e GITHUB_CLIENT_SECRET=test_client_secret \
  -e NEXTAUTH_SECRET=test_secret_for_testing_only \
  -e NEXTAUTH_URL=http://localhost:3001 \
  -e RESEND_API_KEY=test_resend_key \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3001 \
  forkspy-test:latest

# Copy test results (optional)
docker cp test-run:/app/coverage ./coverage 2>/dev/null || echo "No coverage directory"
docker cp test-run:/app/test-results ./test-results 2>/dev/null || echo "No test-results directory"

# Clean up test container
docker rm test-run
```

### 2. 🏗️ **Docker Build Stage** (Replicates `docker-build` job)

```bash
# Build production image locally
docker build -t forkspy-local:latest .

# Verify build succeeded
docker images forkspy-local:latest

# Test image can start
docker run -d --name build-test \
  -e NODE_ENV=production \
  -e NEXTAUTH_SECRET=test_secret \
  -e NEXTAUTH_URL=http://localhost:3001 \
  -e GITHUB_CLIENT_ID=test_client \
  -e GITHUB_CLIENT_SECRET=test_secret \
  -e MONGODB_URI=mongodb://localhost:27017/test \
  -e RESEND_API_KEY=test_key \
  -p 3002:3000 \
  forkspy-local:latest

# Wait for startup
sleep 10

# Test health endpoint
curl -f http://localhost:3002/api/health || echo "Health check failed"

# Clean up
docker stop build-test && docker rm build-test
```

### 3. 🔒 **Security Scanning** (Replicates `docker-security` job)

```bash
# Build image for security scan
docker build -t forkspy-security-scan:latest .

# Run Trivy vulnerability scanner (if installed)
# Install: brew install trivy (macOS) or apt-get install trivy (Ubuntu)
trivy image forkspy-security-scan:latest --severity HIGH,CRITICAL || echo "Trivy not installed - install with: brew install trivy"

# Alternative: Use Docker to run Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $HOME/.cache/trivy:/root/.cache/ \
  aquasec/trivy:latest image forkspy-security-scan:latest --severity HIGH,CRITICAL
```

### 4. 🧮 **Build Test Validation** (Replicates `docker-build-test` job)

```bash
# Build production image
docker build -t forkspy-build-test:latest .

# Test container startup with health check
docker run -d --name test-container \
  -e NODE_ENV=production \
  -e NEXT_TELEMETRY_DISABLED=1 \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  -e NEXTAUTH_SECRET=test_secret \
  -e NEXTAUTH_URL=http://localhost:3001 \
  -e GITHUB_CLIENT_ID=test_client \
  -e GITHUB_CLIENT_SECRET=test_secret \
  -e MONGODB_URI=mongodb://localhost:27017/test \
  -e RESEND_API_KEY=test_key \
  -p 3003:3000 \
  forkspy-build-test:latest

# Wait for container to start
sleep 15

# Test health endpoint using the built-in healthcheck script
docker exec test-container node healthcheck.mjs

# Check if container is running and healthy
docker inspect -f '{{.State.Running}}' test-container

# View logs if needed
docker logs test-container

# Cleanup
docker stop test-container && docker rm test-container
```

### 5. 🚀 **Full Local Docker Compose Test**

```bash
# Test production Docker Compose setup
docker-compose down --volumes  # Clean up any existing containers
docker-compose build          # Build fresh image
docker-compose up -d          # Start in detached mode

# Wait for startup
sleep 15

# Test health endpoint on port 3001
curl -f http://localhost:3001/api/health

# Check container status
docker-compose ps

# View logs
docker-compose logs app

# Clean up
docker-compose down
```

## 🔧 Quick Test Scripts

### One-Command Full Test
```bash
# Run all tests in sequence
./scripts/test-docker-local.sh  # (create this script if needed)
```

### Individual Test Commands
```bash
# Test just the build
npm run docker:test

# Test production setup
docker-compose up -d && sleep 10 && curl http://localhost:3001/api/health && docker-compose down

# Quick healthcheck test
docker build -t test . && docker run --rm -e NEXTAUTH_SECRET=test test node healthcheck.mjs
```

## 🚨 Common Issues to Watch For

### 1. **ES Module Issues**
- ❌ Error: `Cannot use import statement outside a module`
- ✅ Fix: Ensure healthcheck script uses `.mjs` extension

### 2. **Port Conflicts**
- ❌ Error: `bind: address already in use`
- ✅ Fix: Use different ports (3001, 3002, 3003) or stop conflicting containers

### 3. **Environment Variables**
- ❌ Error: Missing required env vars
- ✅ Fix: Check all required vars are set in test commands

### 4. **Docker Build Context**
- ❌ Error: Files not found during COPY
- ✅ Fix: Ensure files exist and Docker context is correct

### 5. **Health Check Failures**
- ❌ Error: Health check timeout
- ✅ Fix: Increase sleep time or check application startup

## 📦 Before Each Push

Run this minimal test sequence:

```bash
# 1. Quick build test
docker build --target test -t test-quick . && echo "✅ Test build OK"

# 2. Quick production build test  
docker build -t prod-quick . && echo "✅ Production build OK"

# 3. Quick health check test
docker run --rm -d --name health-test -e NEXTAUTH_SECRET=test -p 3004:3000 prod-quick && \
sleep 10 && \
docker exec health-test node healthcheck.mjs && \
docker stop health-test && \
echo "✅ Health check OK"

# 4. Clean up
docker image prune -f
```

## 🎯 Success Indicators

All local tests should show:
- ✅ Docker builds complete without errors
- ✅ Test containers exit with code 0
- ✅ Health checks return status 200
- ✅ No port conflicts
- ✅ Security scans show no critical vulnerabilities
- ✅ All containers start and stop cleanly

If all these pass locally, your CI/CD pipeline should succeed! 🚀

## 🔄 Automation Script

Create `scripts/pre-push-docker-test.sh`:

```bash
#!/bin/bash
echo "🐳 Running pre-push Docker tests..."

# Build test
docker build --target test -t forkspy-test:latest . || exit 1
echo "✅ Test build successful"

# Build production
docker build -t forkspy-prod:latest . || exit 1
echo "✅ Production build successful"

# Quick health test
docker run -d --name quick-test -e NEXTAUTH_SECRET=test -p 3005:3000 forkspy-prod:latest
sleep 10
docker exec quick-test node healthcheck.mjs || exit 1
docker stop quick-test && docker rm quick-test
echo "✅ Health check successful"

# Clean up
docker image prune -f

echo "🎉 All Docker tests passed! Ready to push."
```

Make it executable: `chmod +x scripts/pre-push-docker-test.sh`

Then run before each push: `./scripts/pre-push-docker-test.sh`
