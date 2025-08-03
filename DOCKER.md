# 🐳 ForkSpy Docker Complete Guide

> **Comprehensive Docker integration across Development, Testing, and Production phases**

## 📋 Overview

ForkSpy implements a complete three-phase Docker strategy:

- **✅ Phase 1 - Development**: Local development with hot reloading and live code changes
- **✅ Phase 2 - Testing**: Comprehensive test suite execution in isolated Docker environment  
- **✅ Phase 3 - Production**: Enterprise-grade deployment with security hardening and monitoring

### Production Achievement Summary
- **🛡️ Security**: Non-root execution, Alpine Linux (126MB), resource limits
- **📊 Performance**: 117.7MB memory usage (22.99% of 512MB), 0.00% CPU idle
- **🔍 Monitoring**: Health checks every 30s, comprehensive metrics endpoint
- **🚀 Ready**: Production deployment to AWS, GCP, Azure, Kubernetes

## Prerequisites

- **Docker Desktop** (recommended) or Docker Engine 20.10+
- **Docker Compose** v2.0+
- **Git** for version control

## Project Structure

```
forkspy/
├── Dockerfile                  # 🏭 Production multi-stage build
├── Dockerfile.dev              # 🔧 Development container definition
├── docker-compose.yml          # 🚀 Production orchestration
├── docker-compose.dev.yml      # 🔧 Development orchestration
├── docker-compose.test.yml     # 🧪 Testing environment (Phase 2)
├── healthcheck.js              # 🏥 Production health monitoring
├── .dockerignore              # 📋 Files to exclude from Docker builds
├── .env.production            # 🏭 Production environment variables
├── .env                       # 🔧 Development environment variables
└── DOCKER.md                  # 📚 This comprehensive guide
```

---

## 🚀 Phase 1: Development Environment

### 1. Setup Environment

```bash
# Clone the repository
git clone https://github.com/shashankxrm/forkspy.git
cd forkspy

# Copy environment variables
cp .env.local .env
# Edit .env with your GitHub OAuth, MongoDB, and Resend API credentials
```

### 2. Start Development Environment

```bash
# Start with Docker Compose
npm run docker:dev

# Alternative: Direct Docker Compose command
docker-compose -f docker-compose.dev.yml up
```

### 3. Access Application

- **Application**: http://localhost:3000
- **Hot Reloading**: Enabled automatically
- **Code Changes**: Reflected instantly in the browser

### Development Features

- **🔄 Hot Reloading**: Instant code changes without container restart
- **📁 Volume Mounting**: Local code synchronized with container
- **🔧 Environment Integration**: Uses your local `.env` configuration
- **🌐 External Services**: Connects to MongoDB Atlas, GitHub API, Resend API
- **🛠️ Development Tools**: Full Node.js development environment

---

## 🧪 Phase 2: Testing Environment

### Test Execution

```bash
# Run complete test suite in Docker
npm run docker:test

# Expected output:
# ✅ 21/21 tests passing
# ✅ 80%+ code coverage achieved
# ✅ TypeScript compliance verified
# ✅ Build process validated
```

### Testing Features

- **🧪 Complete Test Suite**: All unit and integration tests
- **📊 Coverage Reporting**: Detailed coverage metrics and thresholds
- **🔍 Code Quality**: ESLint validation and TypeScript compliance
- **🚀 Build Verification**: Ensures production build succeeds
- **⚡ Fast Execution**: Optimized test runner configuration

### Test Categories Covered

```bash
# Test breakdown:
├── Unit Tests (13 tests)
│   ├── Utility functions (lib/utils.test.ts) - 5 tests
│   ├── Custom hooks (hooks/useRequireAuth.test.ts) - 5 tests
│   └── Window hooks (hooks/useWindowSize.test.ts) - 3 tests
└── Integration Tests (8 tests)
    ├── Auth configuration (api/auth/auth-options.test.ts) - 4 tests
    └── Repository API (api/repos/get-repos.test.ts) - 4 tests
```

---

## 🏭 Phase 3: Production Environment ⭐

### Production Deployment

```bash
# Build production image
docker-compose build

# Start production environment
docker-compose up -d

# Verify deployment status
docker-compose ps
curl http://localhost:3000/api/health
```

### Production Architecture

#### Multi-Stage Build Strategy
```dockerfile
# Three-stage optimization:
FROM node:18-alpine AS base      # Lightweight Alpine base (126MB)
FROM base AS deps               # Dependencies installation layer
FROM base AS builder            # Application build layer  
FROM base AS runner             # Production runtime layer
```

#### Security Hardening
- **Non-root execution**: Dedicated `nextjs:nodejs` user (UID/GID 1001)
- **Minimal attack surface**: Alpine Linux base image
- **Resource constraints**: 512MiB memory limit, CPU quotas
- **Environment isolation**: Production-only configuration
- **Dependency optimization**: Only production dependencies included

### Production Performance Metrics

```bash
# Real production metrics:
Container: forkspy-app-prod
Status: ✅ Running and healthy
Memory: 117.7MiB / 512MiB (22.99% efficiency)
CPU: 0.00% (idle, ready for traffic)
Network: 388kB / 319kB I/O
Processes: 28 PIDs (lean process count)
Health: ✅ Automated checks passing every 30s
```

### Health Monitoring System

#### Built-in Health Endpoint
```bash
# Health check endpoint
curl http://localhost:3000/api/health

# Response:
{
  "status": "healthy",
  "service": "forkspy",
  "version": "0.1.0",
  "environment": "production", 
  "uptime": "5 minutes",
  "memory": {
    "used": "117.7MB",
    "total": "512MB"
  },
  "timestamp": "2025-08-03T03:35:40.720Z"
}
```

#### Docker Health Checks
```yaml
# Automated health monitoring
healthcheck:
  test: ["CMD", "node", "healthcheck.js"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 5s
```

### Production Configuration Files

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: forkspy-app-prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    mem_limit: 512m
    cpus: 1.0
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

#### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0

# Your production values:
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
MONGODB_URI=your-production-mongodb-uri
RESEND_API_KEY=your-resend-api-key
```

### Production Deployment Ready

#### Cloud Platform Compatibility

**Amazon Web Services (AWS)**
```bash
# ECS deployment
docker tag forkspy-app:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/forkspy:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/forkspy:latest

# EKS Kubernetes deployment
kubectl apply -f k8s/forkspy-deployment.yaml
```

**Google Cloud Platform (GCP)**
```bash
# Cloud Run deployment
docker tag forkspy-app:latest gcr.io/PROJECT-ID/forkspy:latest
docker push gcr.io/PROJECT-ID/forkspy:latest
gcloud run deploy forkspy --image gcr.io/PROJECT-ID/forkspy:latest
```

**Microsoft Azure**
```bash
# Container Instances deployment
docker tag forkspy-app:latest forkspyregistry.azurecr.io/forkspy:latest
docker push forkspyregistry.azurecr.io/forkspy:latest
az container create --resource-group myResourceGroup --name forkspy --image forkspyregistry.azurecr.io/forkspy:latest
```

---

## 🔧 Available Commands

```bash
# Development (Phase 1)
npm run docker:dev              # Start development environment
npm run docker:dev:build        # Build development image
npm run docker:dev:detached     # Start in background
npm run docker:stop             # Stop development containers

# Testing (Phase 2)
npm run docker:test             # Run all tests in containers
npm run docker:test:down        # Stop test containers

# Production (Phase 3) ⭐
docker-compose build            # Build production image
docker-compose up -d            # Start production (detached)
docker-compose ps               # Check container status
docker-compose logs app         # View application logs
docker stats forkspy-app-prod   # Monitor resource usage
curl http://localhost:3000/api/health  # Test health endpoint

# Utilities
docker ps                       # List running containers
docker logs forkspy-app         # View application logs
docker exec -it forkspy-app sh  # Access container shell
```

---

## 📊 Production Monitoring & Health

### Health Check System

#### Health Check Script
```javascript
// healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000,
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => process.exit(1));
req.on('timeout', () => process.exit(1));
req.end();
```

#### Real-time Monitoring
```bash
# Real-time monitoring
watch -n 5 'curl -s http://localhost:3000/api/health | jq'

# Container health status
docker inspect forkspy-app-prod --format='{{.State.Health.Status}}'

# Resource monitoring
docker stats forkspy-app-prod --no-stream
```

### Production Logging
```bash
# View application logs
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f app

# Filter logs by level
docker-compose logs app | grep ERROR

# Export logs to file
docker-compose logs app > forkspy-logs.txt
```

---

## 🔧 Docker Configuration Details

### Production Dockerfile (Multi-stage)

```dockerfile
# Multi-stage production build for security and optimization
FROM node:18-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runtime stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/healthcheck.js ./healthcheck.js

# Switch to non-root user
USER nextjs

# Expose port and set environment
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
```

### Development Dockerfile

```dockerfile
# Simple development setup with hot reloading
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
```

### docker-compose.dev.yml

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: forkspy-app
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    env_file:
      - .env
    environment:
      - NODE_ENV=development
```

### docker-compose.yml (Production)

```yaml
version: '3.8'
services:
  app:
    build: .
    container_name: forkspy-app-prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    mem_limit: 512m
    cpus: 1.0
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

### .dockerignore

Excludes unnecessary files from Docker builds:
```
node_modules/
.git/
.next/
coverage/
test-results/
*.log
.env*
README.md
.vscode/
.github/
__tests__/
```

---

## 🔧 Environment Configuration

### 1. Making Code Changes

1. Edit any file in the project
2. Save the file
3. Docker automatically detects the change
4. Next.js reloads the application
5. Browser refreshes automatically

### 2. Installing New Dependencies

```bash
# Option 1: Rebuild the container (recommended)
npm run docker:dev:build
npm run docker:dev

# Option 2: Install inside running container
docker exec forkspy-app npm install <package-name>
```

### 3. Debugging

```bash
# View real-time logs
docker logs -f forkspy-app

# Access container shell
docker exec -it forkspy-app sh

# Check container status
docker ps
docker inspect forkspy-app
```

## Environment Variables

### Environment Variables

#### Required Variables (All Phases)
```bash
# GitHub OAuth (Required)
GITHUB_CLIENT_ID=your_github_oauth_app_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_secret

# Database (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/forkspy

# Authentication (Required)
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Email Service (Required)
RESEND_API_KEY=your_resend_api_key
```

#### Development Variables (.env)
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Production Variables (.env.production)
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
NEXTAUTH_URL=https://your-production-domain.com
```

---

## 🔧 Development Workflow

### 1. Making Code Changes

1. Edit any file in the project
2. Save the file
3. Docker automatically detects the change
4. Next.js reloads the application
5. Browser refreshes automatically

### 2. Installing New Dependencies

```bash
# Option 1: Rebuild the container (recommended)
npm run docker:dev:build
npm run docker:dev

# Option 2: Install inside running container
docker exec forkspy-app npm install <package-name>
```

### 3. Debugging

```bash
# View real-time logs
docker logs -f forkspy-app

# Access container shell
docker exec -it forkspy-app sh

# Check container status
docker ps
docker inspect forkspy-app
```

---

## 🔍 Troubleshooting

### Common Issues

### Common Issues & Solutions

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000
netstat -tlnp | grep :3000

# Solution: Use different port or kill conflicting process
# In docker-compose.yml: "3001:3000"
```

#### Container Build Issues
```bash
# Clean rebuild
docker-compose build --no-cache

# Clear Docker cache
docker system prune -a

# Check Docker space
docker system df
```

#### Production Health Check Failures
```bash
# Check health endpoint manually
docker exec forkspy-app-prod curl http://localhost:3000/api/health

# View health check logs
docker inspect forkspy-app-prod --format='{{range .State.Health.Log}}{{.Output}}{{end}}'

# Restart health monitoring
docker-compose restart app
```

#### Memory Issues
```bash
# Check container memory usage
docker stats forkspy-app-prod --no-stream

# Solution: Increase memory limit in docker-compose.yml
mem_limit: 1g
```

#### Environment Variable Issues
```bash
# Verify environment variables inside container
docker exec forkspy-app-prod env | grep -E "(GITHUB|MONGODB|NEXTAUTH)"

# Debug environment loading
docker exec forkspy-app-prod node -p "process.env.GITHUB_CLIENT_ID"
```

### Networking Issues & Prevention

**Common networking problem:**
```bash
# This error indicates orphaned Docker networks:
# "Error response from daemon: failed to set up container networking"
```

**Prevention & Best Practices:**
```bash
# ✅ GOOD - Always use proper cleanup
npm run docker:stop              # Graceful development cleanup
docker-compose down              # Production cleanup
npm run docker:test:down         # Test cleanup

# ❌ AVOID - These can leave orphaned networks
# - Ctrl+C while containers are starting
# - Force killing Docker processes  
# - Changing docker-compose files without cleanup
```

**Solution for networking issues:**
```bash
# Clean up orphaned networks and containers
npm run docker:stop              
docker network prune -f          # Remove orphaned networks
docker system prune -f           # Remove unused containers/images

# Then restart
npm run docker:dev               # Development
# or
docker-compose up -d             # Production
```

**Regular maintenance:**
```bash
# Weekly cleanup (removes unused resources)
docker system prune -f

# Remove stopped containers
docker container prune -f

# Remove unused networks
docker network prune -f

# See disk usage
docker system df
```

### Performance Tips

1. **Use .dockerignore**: Ensure unnecessary files are excluded
2. **Layer caching**: Optimize Dockerfile for better caching
3. **Resource limits**: Set appropriate memory and CPU limits
4. **Health checks**: Use efficient health check scripts
5. **Clean up**: Regularly clean unused Docker resources

```bash
# Performance monitoring
docker stats forkspy-app-prod --no-stream

# Resource optimization
docker inspect forkspy-app-prod | grep -A 5 Memory
```

---

## 🛡️ Security Best Practices

### Image Security
- **Alpine Linux base**: Minimal attack surface (126MB vs 1GB+ standard)
- **Non-root execution**: All processes run as `nextjs:nodejs` user
- **Multi-stage builds**: Only production artifacts in final image
- **Dependency validation**: Only required packages included

### Runtime Security
- **Resource constraints**: Memory and CPU limits enforced
- **Environment isolation**: Production-specific configuration
- **Secret management**: Secure environment variable handling
- **Health monitoring**: Automated failure detection

### Security Commands
```bash
# Scan image for vulnerabilities
docker scan forkspy-app:latest

# Check running processes
docker exec forkspy-app-prod ps aux

# Verify non-root execution
docker exec forkspy-app-prod whoami
# Should return: nextjs
```

---

## 🎯 Production Deployment Checklist

### Pre-deployment Validation
- [ ] **Environment Variables**: All production values configured
- [ ] **Build Success**: `docker-compose build` completes without errors
- [ ] **Health Check**: `/api/health` endpoint responds correctly
- [ ] **Resource Limits**: Memory and CPU appropriate for environment
- [ ] **Security Scan**: No critical vulnerabilities in image
- [ ] **Performance Test**: Load testing completed successfully

### Deployment Steps
1. **Build production image**: `docker-compose build --no-cache`
2. **Test locally**: `docker-compose up -d && curl http://localhost:3000/api/health`
3. **Tag for registry**: `docker tag forkspy-app:latest your-registry/forkspy:v1.0.0`
4. **Push to registry**: `docker push your-registry/forkspy:v1.0.0`
5. **Deploy to production**: Platform-specific deployment commands

### Post-deployment Monitoring
- [ ] **Container Status**: Verify healthy and running
- [ ] **Application Response**: Test all major endpoints
- [ ] **Resource Usage**: Monitor memory and CPU utilization
- [ ] **Log Monitoring**: Check for errors or warnings
- [ ] **Performance Metrics**: Validate response times

---

## 📚 Best Practices Summary

### Security
1. **Never run as root**: Use dedicated user accounts
2. **Use specific tags**: Avoid `latest` tags in production
3. **Minimal images**: Alpine Linux for smaller attack surface
4. **Environment secrets**: Use secure secret management

### Performance  
1. **Multi-stage builds**: Separate build and runtime stages
2. **Layer optimization**: Order Dockerfile for maximum caching
3. **Resource limits**: Set appropriate memory and CPU limits
4. **Health checks**: Implement efficient monitoring

### Operations
1. **Graceful shutdowns**: Always use proper cleanup commands
2. **Logging strategy**: Structured JSON logging for production
3. **Monitoring**: Implement comprehensive health checks
4. **Documentation**: Keep deployment docs up to date

---

## 📞 Support & Resources

### Documentation Links
- **Main Project Documentation**: [project.md](./project.md)
- **GitHub Repository**: https://github.com/shashankxrm/forkspy
- **Live Application**: https://forkspy.vercel.app

### Getting Help

If you encounter issues:

1. **Check logs**: `docker-compose logs app`
2. **Verify health**: `curl http://localhost:3000/api/health`
3. **Review configuration**: Ensure all environment variables are set
4. **Clean rebuild**: `docker-compose build --no-cache`
5. **Contact support**: [shashankreddy0608@gmail.com](mailto:shashankreddy0608@gmail.com)

---

**🎉 Congratulations! You now have a complete, production-ready Docker setup for ForkSpy with enterprise-grade security, monitoring, and deployment capabilities.**
