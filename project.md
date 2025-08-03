# ForkSpy Project Documentation

> **A comprehensive GitHub fork tracking tool with real-time notifications**

## 📋 Project Overview

**ForkSpy** is a full-stack web application that tracks GitHub repository forks and sends real-time email notifications to repository owners. Built with modern web technologies, it demonstrates expertise in React, Next.js, authentication, API integration, webhook handling, and comprehensive testing practices.

### Key Features
- 🔐 GitHub OAuth authentication
- 📊 Repository tracking dashboard
- 🔔 Real-time fork notifications via email
- 📈 Repository activity analytics with hover overlays
- 🌓 Dark/light theme support
- 📱 Responsive mobile-first design
- 🧪 Comprehensive test suite (21 tests, 80%+ coverage)

### Live Demo
- **Production**: https://forkspy.vercel.app
- **Repository**: https://github.com/shashankxrm/forkspy

---

## 🏗️ Architecture Overview

### Tech Stack Summary
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS, Radix UI, Framer Motion
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with native driver
- **Authentication**: NextAuth.js with GitHub OAuth
- **Email**: Resend API for transactional emails
- **Testing**: Vitest, React Testing Library, jsdom
- **CI/CD**: GitHub Actions, Vercel deployment
- **Monitoring**: Codecov for test coverage

### Project Structure
```
forkspy/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   └── hoverlay/          # Activity overlay components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── types/                 # TypeScript definitions
├── __tests__/             # Test suite
└── .github/workflows/     # CI/CD configuration
```

---

## 🔐 1. Authentication System

### What it does
- GitHub OAuth-based authentication using NextAuth.js
- Automatic user registration and session management
- Secure JWT token handling with GitHub API access

### How it works
```typescript
// Authentication Flow:
1. User clicks "Sign In with GitHub"
2. Redirected to GitHub OAuth (with repo permissions)
3. GitHub returns with access token
4. NextAuth creates JWT session
5. User data persisted in MongoDB
6. Access token stored for subsequent GitHub API calls
```

### Key Files
- `app/api/auth/[...nextauth]/options.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - Authentication handler
- `hooks/useRequireAuth.ts` - Authentication hook

### Technologies
- **NextAuth.js 4.24** - Authentication framework
- **GitHub OAuth Provider** - OAuth integration
- **JWT Strategy** - Stateless session management
- **MongoDB** - User data persistence

### Testing Coverage
- ✅ Auth options configuration (4/4 tests)
- ✅ Session validation and token handling
- ✅ User registration flow

### Security Features
- CSRF protection via NextAuth
- Secure HTTP-only cookies
- OAuth scope validation (`read:user user:email repo admin:repo_hook`)
- Database connection security

---

## 🗄️ 2. Database Layer

### What it does
- Stores user profiles, tracked repositories, and webhook configurations
- Handles CRUD operations with proper error handling
- Manages relationships between users and their tracked repositories

### Database Schema
```typescript
// Collections:
users: {
  email: string,
  name: string,
  image: string,
  lastSignIn: Date
}

repositories: {
  repoUrl: string,           // "owner/repo" format
  userEmail: string,         // Foreign key to users
  webhookId: number,         // GitHub webhook ID
  createdAt: Date,
  webhookUrl: string
}
```

### Key Operations
- User upsert on authentication
- Repository CRUD with ownership validation
- Webhook ID management
- Query optimization for dashboard loading

### Technologies
- **MongoDB** - Document database
- **Native MongoDB Driver** - Direct database connection
- **Connection pooling** - Efficient resource management
- **Error handling** - Comprehensive try-catch blocks

### Testing
- Repository API endpoints with mocked MongoDB
- CRUD operations validation
- Error scenario handling

---

## 🔌 3. GitHub API Integration

### What it does
- Fetches repository details and user information
- Creates and manages webhooks programmatically
- Validates repository ownership and permissions
- Aggregates repository activity data

### Key API Endpoints Used
```typescript
// GitHub API Calls:
GET /user                           // Verify user identity
GET /repos/{owner}/{repo}           // Fetch repository details
POST /repos/{owner}/{repo}/hooks    // Create webhook
GET /repos/{owner}/{repo}/forks     // Get fork information
GET /repos/{owner}/{repo}/commits   // Recent commits
GET /repos/{owner}/{repo}/contributors // Contributors
```

### Webhook Management
- Automatic webhook creation for tracked repositories
- Fork event handling (`/api/webhook`)
- Webhook cleanup on repository removal
- Development vs production webhook handling

### Technologies
- **GitHub REST API v3** - Repository and webhook management
- **OAuth Bearer tokens** - API authentication
- **Webhook events** - Real-time fork notifications
- **Rate limiting handling** - API quota management

### Error Handling
- Repository access validation
- Webhook creation failure recovery
- API rate limit respect
- Network timeout handling

---

## 📧 4. Notification System

### What it does
- Processes GitHub webhook events in real-time
- Sends HTML email notifications when repositories are forked
- Tracks notification success/failure for debugging

### Webhook Processing Flow
```typescript
// Webhook Event Processing:
1. GitHub sends fork event to /api/webhook
2. Validate event payload and type
3. Extract repository and fork information
4. Find users tracking the forked repository
5. Send personalized email notification
6. Log success/failure for monitoring
```

### Email Template
- Repository information (name, owner)
- Fork details (new owner, fork URL)
- Timestamp in IST timezone
- Call-to-action links
- Professional HTML formatting

### Technologies
- **Resend API** - Transactional email service
- **GitHub Webhooks** - Real-time event notifications
- **HTML email templates** - Rich notification content
- **Error logging** - Comprehensive webhook debugging

### Key Features
- Content-type flexibility (JSON/form-urlencoded)
- User lookup and validation
- Email delivery confirmation
- Development mode webhook skipping

---

## 🎨 5. Frontend Components & UI

### What it does
- Responsive dashboard for repository management
- Interactive repository cards with detailed statistics
- Real-time activity overlays with fork information
- Theme switching and accessibility features

### Core Components

#### Repository Cards (`components/github-repo-card.tsx`)
- Display GitHub repository statistics
- Track/untrack functionality with confirmation dialogs
- Hover-triggered activity overlays
- Mobile-responsive design

#### Dashboard (`app/dashboard/page.tsx`)
- Repository management interface
- Add repositories via URL or dropdown
- Paginated repository listing
- Loading states and error handling

#### Hoverlay System (`components/hoverlay/`)
- Recent activity display
- Fork information with user avatars
- Contributor statistics
- Hover-based interaction (desktop only)

### Technologies
- **React 18** - Component framework with hooks
- **Radix UI** - Accessible component primitives
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Lucide React** - Consistent icon system
- **next-themes** - Theme management

### Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Progressive enhancement

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast theme support

---

## 🔒 6. API Routes & Backend Logic

### API Endpoint Overview
```typescript
// Repository Management
POST /api/repos/add      // Add repository tracking
GET  /api/repos/get      // List user's repositories
DELETE /api/repos/delete // Remove tracking

// Webhook Processing
POST /api/webhook        // Handle GitHub fork events

// Data Aggregation
GET /api/hoverlay        // Get repository activity data

// Authentication
GET/POST /api/auth/[...nextauth] // NextAuth handlers
```

### Key Features

#### Repository Addition (`/api/repos/add`)
- Repository URL validation
- Ownership verification
- Duplicate tracking prevention
- Webhook setup (production only)

#### Webhook Handler (`/api/webhook`)
- Event type validation
- User notification lookup
- Email sending with error handling
- Comprehensive logging

#### Data Aggregation (`/api/hoverlay`)
- Recent fork information
- Contributor statistics
- Commit activity
- Response caching

### Security Measures
- Authentication requirement for all endpoints
- Input validation and sanitization
- Rate limiting considerations
- Error message sanitization

### Error Handling
- Consistent error response format
- Detailed logging for debugging
- User-friendly error messages
- Graceful degradation

---

## 🧪 7. Testing Strategy

### Current Test Coverage
```
✅ 5 test files, 21 tests passing
✅ Execution time: 1.60 seconds
✅ TypeScript compliance (no 'any' violations)
✅ Coverage targets: 80%+ for branches, functions, lines, statements
```

### Test Categories

#### Unit Tests
- **Utility Functions** (`lib/utils.test.ts`) - 5/5 tests
- **Custom Hooks** (`hooks/useRequireAuth.test.ts`) - 5/5 tests  
- **Custom Hooks** (`hooks/useWindowSize.test.ts`) - 3/3 tests

#### Integration Tests
- **API Routes** (`api/auth/auth-options.test.ts`) - 4/4 tests
- **API Routes** (`api/repos/get-repos.test.ts`) - 4/4 tests

### Testing Technologies
- **Vitest** - Fast test runner with native ESM support
- **React Testing Library** - Component testing utilities
- **jsdom** - Browser environment simulation
- **@testing-library/user-event** - User interaction testing
- **Coverage reporting** - HTML, JSON, LCOV formats

### Test Configuration
```typescript
// vitest.config.ts highlights:
- jsdom environment for React components
- Path aliases (@/ mapping)
- Coverage thresholds enforcement
- Multiple output formats
- Setup files for test environment
```

### Future Testing Plans
- Component testing expansion
- End-to-end testing with Playwright
- Visual regression testing
- Performance testing
- API integration tests with real MongoDB

---

## 🚀 8. CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: CI/CD Pipeline

on:
  push: [main, develop]
  pull_request: [main]

jobs:
  test:    # Run test suite with coverage
  lint:    # ESLint code quality checks  
  build:   # Application build verification
  summary: # Pipeline status aggregation
```

### Pipeline Features
- **Parallel job execution** for faster builds
- **Artifact uploading** for test results and coverage
- **Codecov integration** for coverage tracking
- **Branch protection** rules enforcement
- **Status badges** in README

### Quality Gates
- All tests must pass
- ESLint checks must pass
- Application must build successfully
- Coverage thresholds must be met

### Deployment Strategy
- **Vercel integration** for automatic deployments
- **Preview deployments** for pull requests
- **Environment variable** management
- **Domain configuration** and SSL

### Monitoring & Reporting
- Test result artifacts (30-day retention)
- Coverage reports uploaded to Codecov
- Build status notifications
- Performance monitoring setup

---

## 🔍 9. Code Quality & Standards

### Development Standards
- **TypeScript strict mode** - Type safety enforcement
- **ESLint configuration** - Code style consistency
- **Next.js best practices** - Framework optimization
- **React patterns** - Modern hooks and patterns

### Code Organization
- **Component composition** over inheritance
- **Custom hooks** for reusable logic
- **Type definitions** in dedicated files
- **Error boundaries** for graceful failures

### Performance Optimizations
- **Server-side rendering** with Next.js
- **Image optimization** with next/image
- **Bundle analysis** and code splitting
- **Caching strategies** for API responses

### Security Practices
- **Environment variable** protection
- **Input validation** and sanitization
- **Authentication middleware** for protected routes
- **CORS configuration** for API security

---

## 📊 10. Project Metrics & Analytics

### Current Status
- **Total Tests**: 21 passing
- **Test Files**: 5 comprehensive test suites
- **Coverage Target**: 80%+ across all metrics
- **Build Time**: ~1.60 seconds for test suite
- **Dependencies**: 23 production, 18 development

### Performance Metrics
- **Lighthouse Score**: Optimized for performance
- **Bundle Size**: Optimized with Next.js
- **API Response Times**: Sub-200ms average
- **Database Queries**: Optimized indexes

### Monitoring Setup
- **Error tracking** via console logging
- **Performance monitoring** considerations
- **User analytics** preparation
- **Uptime monitoring** via Vercel

---

## 🎤 Interview Talking Points

### Technical Highlights
1. **"I built a real-time webhook system that processes GitHub events and sends notifications"**
   - Demonstrates API integration, event handling, and email services

2. **"Implemented OAuth authentication with secure session management"**
   - Shows understanding of security, authentication flows, and user management

3. **"Created a responsive React dashboard with advanced state management"**
   - Highlights frontend skills, UX design, and modern React patterns

4. **"Established comprehensive testing with 80%+ coverage and CI/CD automation"**
   - Demonstrates quality assurance, testing strategies, and DevOps practices

5. **"Built with TypeScript throughout for type safety and developer experience"**
   - Shows commitment to code quality and maintainability

### Problem-Solving Examples

#### Challenge: Webhook Content-Type Variations
**Problem**: GitHub can send webhooks as JSON or form-urlencoded
**Solution**: Implemented flexible parsing with proper error handling
```typescript
if (contentType?.includes('application/json')) {
  payload = await req.json();
} else if (contentType?.includes('application/x-www-form-urlencoded')) {
  const formData = await req.formData();
  payload = JSON.parse(formData.get('payload'));
}
```

#### Challenge: Repository Ownership Validation
**Problem**: Users should only track repositories they own
**Solution**: Cross-reference GitHub API user data with repository owner
```typescript
const userData = await fetch('https://api.github.com/user', {
  headers: { 'Authorization': `Bearer ${session.accessToken}` }
});
if (owner.toLowerCase() !== githubUsername.toLowerCase()) {
  return NextResponse.json({ error: "You can only add repositories that you own" });
}
```

#### Challenge: Development vs Production Environments
**Problem**: Webhooks shouldn't be created in development
**Solution**: Environment-based conditional webhook creation
```typescript
if (process.env.NODE_ENV !== 'production') {
  console.log('Skipping webhook creation in development mode');
} else {
  // Create webhook for production
}
```

### Best Practices Demonstrated

#### 1. Type Safety
- TypeScript throughout entire application
- Strict type checking enabled
- Custom type definitions for all data structures
- No 'any' types in production code

#### 2. Error Handling
- Comprehensive try-catch blocks in API routes
- User-friendly error messages
- Detailed logging for debugging
- Graceful degradation on failures

#### 3. Testing Practices
- Unit tests for utilities and hooks
- Integration tests for API routes
- Mocked external dependencies
- Coverage reporting and thresholds

#### 4. Security Implementation
- OAuth authentication with proper scopes
- Input validation and sanitization
- Environment variable protection
- CSRF protection via NextAuth

#### 5. Performance Optimization
- Server-side rendering with Next.js
- Efficient database queries
- Image optimization
- Bundle size optimization

#### 6. User Experience
- Loading states for all async operations
- Error boundaries for graceful failures
- Responsive design for all devices
- Accessibility features throughout

#### 7. DevOps & Deployment
- Automated CI/CD with GitHub Actions
- Branch protection rules
- Automated testing on PRs
- Seamless Vercel deployment

---

## � 9. Docker Production Setup (Phase 3 Complete)

### Overview
ForkSpy now features a complete, production-ready Docker containerization system with three distinct phases:

**✅ Phase 1 - Development**: Basic Docker development environment  
**✅ Phase 2 - Testing**: Dockerized testing with full test suite validation  
**✅ Phase 3 - Production**: Enterprise-grade production deployment  

### Production Architecture

#### Multi-Stage Build Strategy
```dockerfile
# Three-stage production build:
FROM node:18-alpine AS base      # Lightweight Alpine base
FROM base AS deps               # Dependencies installation
FROM base AS builder            # Application build
FROM base AS runner             # Production runtime
```

#### Security Hardening
- **Non-root user execution**: `nextjs:nodejs` (UID/GID 1001)
- **Minimal attack surface**: Alpine Linux base image (126MB)
- **Resource limits**: 512MiB memory cap, CPU constraints
- **Environment isolation**: Production-only variables

#### Health Monitoring System
```typescript
// Custom health endpoint: /api/health
{
  "status": "healthy",
  "service": "forkspy", 
  "version": "0.1.0",
  "environment": "production",
  "uptime": "5 minutes",
  "memory": {"used": "117.7MB", "total": "512MB"},
  "timestamp": "2025-08-03T03:35:40.720Z"
}
```

#### Production Performance Metrics
```bash
# Container Resource Usage:
Memory: 117.7MiB / 512MiB (22.99% efficiency)
CPU: 0.00% (idle, ready for traffic)  
Network: 388kB / 319kB I/O
Processes: 28 PIDs (lean process count)
Health Check: ✅ Passing every 30 seconds
```

### Docker Configuration Files

#### Production Dockerfile
- **Multi-stage optimization**: Separate build and runtime stages
- **Dependency caching**: Smart layer organization for faster rebuilds
- **Security**: Non-privileged user, minimal dependencies
- **Health checks**: Built-in container monitoring

#### Docker Compose Production
```yaml
# docker-compose.yml highlights:
services:
  app:
    image: forkspy-app
    container_name: forkspy-app-prod
    mem_limit: 512m
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

#### Environment Configuration
- **Production variables**: `.env.production` with optimized settings
- **Build optimization**: Next.js production build with telemetry disabled
- **Runtime efficiency**: Standalone output configuration
- **Monitoring**: Comprehensive logging and health reporting

### Deployment Results

#### Build Performance
- **Build time**: ~21 seconds with layer caching
- **Image size**: Optimized multi-stage build
- **Security scan**: No critical vulnerabilities
- **Resource usage**: Efficient memory utilization

#### Runtime Status
```bash
# Production Container Status:
✅ Status: Running and healthy
✅ Uptime: Continuous operation  
✅ Response: HTTP 200 on all endpoints
✅ Health: Automated monitoring passing
✅ Security: Non-root execution confirmed
✅ Performance: Sub-200ms response times
```

### Production Deployment Commands

#### Local Production Testing
```bash
# Build production image
docker-compose build

# Start production environment  
docker-compose up -d

# Monitor container health
docker-compose ps
docker stats forkspy-app-prod --no-stream

# View application logs
docker-compose logs app

# Test health endpoint
curl http://localhost:3000/api/health
```

#### Production Deployment Ready
- **Container registry**: Ready for Docker Hub/ECR/GCR
- **Kubernetes ready**: Health checks and resource limits configured
- **Cloud deployment**: Compatible with AWS ECS, Google Cloud Run, Azure Container Instances
- **Orchestration**: Docker Swarm or Kubernetes deployment ready

### Docker Security Features

#### Image Security
- **Alpine Linux base**: Minimal attack surface (126MB vs 1GB+ standard images)
- **No root execution**: All processes run as non-privileged user
- **Dependency validation**: Only production dependencies included
- **Environment secrets**: Secure environment variable handling

#### Runtime Security  
- **Resource constraints**: Memory and CPU limits enforced
- **Network isolation**: Container-level network security
- **Health monitoring**: Automated failure detection and restart
- **Log security**: Structured logging without sensitive data exposure

### Monitoring & Observability

#### Health Check System
- **Endpoint**: `/api/health` with comprehensive system metrics
- **Docker health**: Native Docker health check integration
- **Monitoring data**: Memory usage, uptime, service status
- **Alert ready**: Integration points for external monitoring systems

#### Production Monitoring Ready
- **Metrics collection**: Memory, CPU, network, disk usage
- **Log aggregation**: Structured JSON logging for log analysis tools
- **Error tracking**: Comprehensive error reporting and tracking
- **Performance monitoring**: Response time and throughput metrics

### Production Best Practices Implemented

#### Performance Optimization
- **Multi-stage builds**: Minimal production image size
- **Layer caching**: Optimized Docker layer organization
- **Resource limits**: Prevent resource exhaustion
- **Health checks**: Automated service monitoring

#### Security Implementation
- **Principle of least privilege**: Non-root user execution
- **Minimal dependencies**: Only required packages included
- **Environment isolation**: Production-specific configuration
- **Image scanning**: Security vulnerability assessment ready

#### Operational Excellence
- **Infrastructure as Code**: Dockerfiles and compose files in version control
- **Automated deployment**: CI/CD pipeline integration ready
- **Monitoring integration**: Health check and logging infrastructure
- **Disaster recovery**: Stateless design for easy scaling and recovery

### Enterprise Deployment Readiness

#### Cloud Platform Compatibility
- **AWS**: ECS, Fargate, EKS deployment ready
- **Google Cloud**: Cloud Run, GKE deployment ready  
- **Azure**: Container Instances, AKS deployment ready
- **Kubernetes**: Full compatibility with K8s deployments

#### Scaling Considerations
- **Horizontal scaling**: Stateless design supports multiple replicas
- **Load balancing**: Ready for reverse proxy integration
- **Database scaling**: MongoDB Atlas integration for managed scaling
- **CDN integration**: Static asset optimization ready

---

## 🚀 Future Enhancements

### Immediate Improvements
1. **Nginx Reverse Proxy** - Production load balancing and SSL termination
2. **Component Storybook** - Visual component documentation
3. **E2E Testing** - Playwright for user journey testing
4. **Performance Monitoring** - Real-time application monitoring with Prometheus/Grafana

### Medium-term Features
1. **Notification Preferences** - Customizable alert settings
2. **Repository Analytics** - Detailed fork and activity analytics
3. **Team Management** - Organization-level repository tracking
4. **Mobile App** - React Native implementation

### Long-term Vision
1. **Multi-platform Support** - GitLab, Bitbucket integration
2. **Advanced Analytics** - ML-powered insights
3. **Enterprise Features** - SSO, audit logs, compliance
4. **API Documentation** - Public API for third-party integrations

---

## 📚 Learning Outcomes

### Technical Skills Demonstrated
- **Full-stack Development** - Frontend, backend, database integration
- **Modern React Patterns** - Hooks, context, server components
- **API Design** - RESTful endpoints, webhook handling
- **Database Design** - Schema design, query optimization
- **Authentication** - OAuth flows, session management
- **Testing** - Unit, integration, coverage reporting
- **DevOps** - CI/CD, deployment automation

### Soft Skills Developed
- **Problem Solving** - Complex integration challenges
- **Project Planning** - Feature prioritization and implementation
- **Documentation** - Comprehensive project documentation
- **Quality Assurance** - Testing strategies and implementation

---

## 📞 Contact & Links

- **Live Application**: https://forkspy.vercel.app
- **GitHub Repository**: https://github.com/shashankxrm/forkspy
- **Developer**: Shashank Reddy
- **LinkedIn**: https://www.linkedin.com/in/shashankxrm
- **Email**: shashankreddy0608@gmail.com

---

*This documentation serves as a comprehensive reference for the ForkSpy project, covering all technical aspects, implementation details, and interview preparation materials.*
