# Detailed Vitest Testing Plan for ForkSpy

Based on my analysis of your codebase, here's a comprehensive plan to add Vitest testing to your Next.js application:

## � **Docker Integration Strategy**

### **Why Docker First Approach?**
1. **Environment Consistency**: Identical dev/test/prod environments
2. **Database Reliability**: Real MongoDB for integration tests
3. **CI/CD Enhancement**: Container-based workflows
4. **Team Onboarding**: Single `docker-compose up` setup
5. **Scaling Preparation**: Ready for Kubernetes deployment

### **Docker Architecture**
```
forkspy/
├── Dockerfile (Multi-stage production build)
├── Dockerfile.dev (Development optimized)
├── docker-compose.yml (Production stack)
├── docker-compose.dev.yml (Development stack)
├── docker-compose.test.yml (Testing stack)
├── .dockerignore
└── docker/
    ├── mongodb/
    │   ├── init-scripts/
    │   └── mongod.conf
    ├── nginx/
    │   └── nginx.conf
    └── scripts/
        ├── wait-for-it.sh
        └── health-check.sh
```

### **Development Workflow with Docker**
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Testing
docker-compose -f docker-compose.test.yml up --build
docker-compose -f docker-compose.test.yml exec app npm test

# Production build
docker-compose up --build
```

### **Enhanced CI/CD with Containers**
```yaml
name: Docker CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v4
      - name: Build test image
        run: docker build -f Dockerfile.dev -t forkspy:test .
      - name: Run tests in container
        run: |
          docker run --network host \
            -e MONGO_URI=mongodb://admin:password@localhost:27017/forkspy_test \
            forkspy:test npm test
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build production image
        run: docker build -t forkspy:latest .
      - name: Push to registry
        # ... registry push logic
```

## �📋 **Project Overview**
Your ForkSpy application is a Next.js app that tracks GitHub repository forks with the following key features:
- GitHub OAuth authentication via NextAuth
- Repository tracking and management
- Webhook handling for fork notifications
- Email notifications via Resend
- MongoDB data persistence
- Interactive hoverlay components
- Real-time repository activity monitoring

## 🎯 **Testing Strategy**

### **1. Testing Framework Setup**
```json
// Dependencies to add
{
  "devDependencies": {
    "vitest": "^1.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "jsdom": "^23.2.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.2.0",
    "@testing-library/user-event": "^14.5.2",
    "msw": "^2.0.11",
    "mongodb-memory-server": "^9.1.4",
    "next-auth": "^4.24.11",
    "@types/testing-library__jest-dom": "^6.0.0"
  }
}
```

### **2. Test Categories & Priority**

#### **🔥 High Priority - Core Functionality**

**A. API Routes Testing**
- **Authentication APIs** (`/api/auth/[...nextauth]/*`)
  - Session validation
  - GitHub OAuth flow
  - JWT token handling
  
- **Repository Management APIs** (`/api/repos/*`)
  - Add repository validation
  - Repository retrieval
  - Repository deletion
  - Webhook management
  
- **Webhook Handler** (`/api/webhook/route.ts`)
  - Fork event processing
  - Email notifications
  - Database updates

- **Hoverlay API** (`/api/hoverlay/route.ts`)
  - GitHub API integration
  - Data aggregation
  - Error handling

**B. Utility Functions & Hooks**
- `lib/utils.ts` - cn function
- `hooks/useRequireAuth.ts` - Authentication logic
- `hooks/useWindowSize.tsx` - Window size detection

#### **🟡 Medium Priority - Component Testing**

**A. Core Components**
- `components/github-repo-card.tsx` - Repository display
- `components/hoverlay/*` - Interactive overlays
- `components/Header.tsx` - Navigation
- `components/SignInCard.tsx` - Authentication UI

**B. UI Components**
- `components/ui/*` - Reusable UI components
- Theme and mode toggle functionality

#### **🟢 Low Priority - Integration Testing**

**A. Page Components**
- `app/dashboard/page.tsx` - Main dashboard
- `app/page.tsx` - Landing page
- Authentication pages

**B. Database Integration**
- MongoDB operations
- Data persistence

## 🛠 **Implementation Plan (CI/CD First Approach)**

### **Phase 1: Foundation Setup (Week 1)**

1. **Install Core Dependencies**
   ```bash
   npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```

2. **Create Basic Configuration**
   - `vitest.config.ts` - Main Vitest configuration
   - Basic test setup and directory structure

3. **Update package.json Scripts**
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

4. **Create Initial Simple Test**
   - Basic utility function test to verify setup works

### **Phase 2: CI/CD Pipeline Setup (Week 1-2)**

1. **Create GitHub Actions Workflow**
   ```yaml
   # .github/workflows/test.yml
   name: Tests
   
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run test
         - name: Upload coverage
           uses: codecov/codecov-action@v3
           if: always()
   ```

2. **Setup Branch Protection Rules**
   - Require tests to pass before merging
   - Enable status checks

### **Phase 3: Core Testing Implementation (Week 2-3)**

1. **Utility Functions Testing**
   ```
   __tests__/lib/
   └── utils.test.ts
   ```

2. **Basic API Route Testing**
   ```
   __tests__/api/
   ├── auth/
   │   └── basic-auth.test.ts
   └── repos/
       └── basic-repos.test.ts
   ```

3. **Update CI/CD Pipeline**
   - Add test coverage reporting
   - Add parallel test execution
   - Add test result artifacts

### **Phase 4: Expand Testing + CI/CD Evolution (Week 3-4)**

1. **Add More Dependencies as Needed**
   ```bash
   npm install -D msw mongodb-memory-server @testing-library/user-event
   ```

2. **Expand API Testing**
   ```
   __tests__/api/
   ├── auth/
   │   ├── auth-options.test.ts
   │   └── session.test.ts
   ├── repos/
   │   ├── add.test.ts
   │   ├── get.test.ts
   │   ├── delete.test.ts
   │   └── list.test.ts
   ├── webhook/
   │   └── webhook.test.ts
   └── hoverlay/
       └── hoverlay.test.ts
   ```

3. **Enhanced CI/CD Features**
   - Matrix testing (multiple Node versions)
   - Caching optimization
   - Fail-fast strategies
   - Slack/Discord notifications

### **Phase 5: Component Testing + Advanced CI/CD (Week 4-5)**

1. **Component Testing Implementation**
   ```
   __tests__/components/
   ├── github-repo-card.test.tsx
   ├── Header.test.tsx
   ├── SignInCard.test.tsx
   ├── hoverlay/
   │   ├── hoverlay.test.tsx
   │   ├── activity-section.test.tsx
   │   └── forks-section.test.tsx
   └── ui/
       ├── button.test.tsx
       ├── card.test.tsx
       └── avatar.test.tsx
   ```

2. **Advanced CI/CD Features**
   - Visual regression testing setup
   - Performance benchmarking
   - Automated dependency updates
   - Release automation

### **Phase 6: Integration Testing + Production CI/CD (Week 5-6)**

1. **Page Component Testing**
   ```
   __tests__/app/
   ├── page.test.tsx
   └── dashboard/
       └── page.test.tsx
   ```

2. **Production-Ready CI/CD**
   - Staging environment tests
   - Database migration tests
   - Security scanning
   - Deployment automation

## 📁 **Suggested Directory Structure**

```
forkspy/
├── __tests__/
│   ├── setup.ts
│   ├── api/
│   │   ├── auth/
│   │   ├── repos/
│   │   ├── webhook/
│   │   └── hoverlay/
│   ├── components/
│   │   ├── hoverlay/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   └── app/
├── src/test/
│   ├── mocks/
│   │   ├── github-api.ts
│   │   ├── mongodb.ts
│   │   └── next-auth.ts
│   └── utils/
│       ├── test-utils.tsx
│       └── db-utils.ts
├── vitest.config.ts
└── package.json
```

## 🧪 **Test Coverage Goals**

- **API Routes**: 90%+ coverage
- **Utility Functions**: 95%+ coverage
- **Custom Hooks**: 90%+ coverage
- **Core Components**: 80%+ coverage
- **UI Components**: 70%+ coverage
- **Overall Project**: 80%+ coverage

## 🔧 **Key Testing Considerations**

### **Mocking Strategy**
1. **External APIs**: Mock GitHub API responses
2. **Database**: Use MongoDB Memory Server for isolated tests
3. **Authentication**: Mock NextAuth sessions
4. **Email Service**: Mock Resend API calls

### **Environment Variables**
```env
# Test environment variables
GITHUB_ID=test_github_id
GITHUB_SECRET=test_github_secret
MONGO_URI=mongodb://localhost:27017/forkspy_test
NEXTAUTH_SECRET=test_secret
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=test_resend_key
```

### **CI/CD Integration**
- GitHub Actions workflow for running tests
- Coverage reporting with badges
- Branch protection rules
- Automated dependency updates
- Security scanning
- Performance monitoring
- Deployment automation (grows with testing maturity)

## 📈 **Success Metrics**
1. **Test Coverage**: Achieve 80%+ overall coverage
2. **Test Performance**: All tests complete in <30 seconds
3. **Reliability**: 0% flaky tests
4. **Maintainability**: Clear, readable test documentation

## 🚀 **Getting Started Checklist (CI/CD First Approach)**

### Phase 1 Tasks (Foundation):
- [x] Install basic Vitest dependencies
- [x] Create `vitest.config.ts` configuration
- [x] Setup test environment with jsdom
- [x] Add test scripts to `package.json`
- [x] Write one simple utility test to verify setup
- [x] Create basic GitHub Actions workflow
- [x] Test CI/CD pipeline with simple test

### Phase 2 Tasks (CI/CD Setup):
- [x] Setup comprehensive GitHub Actions workflow
- [x] Configure branch protection rules (workflow ready)
- [x] Add coverage reporting
- [x] Setup test result artifacts
- [x] Add status badges to README

### Phase 3 Tasks (Core Testing):
- [x] Test utility functions (`lib/utils.ts`) - **100% coverage, 5/5 tests passing**
- [x] Write basic API route tests (auth options) - **4/4 tests passing**
- [x] Test custom hooks (`useRequireAuth`) - **5/5 tests passing**
- [x] Write basic API route tests (repos/get) - **4/4 tests passing**
- [x] Setup TypeScript compliance for all tests
- [x] Fix all ESLint/TypeScript errors in test files
- [x] Test custom hooks (`useWindowSize`) - **3/3 tests passing**
- [ ] Update CI/CD with coverage thresholds

**Phase 3 Status: COMPLETE ✅**

### Phase 3.5 Tasks (Dockerization):
- [ ] Create multi-stage Dockerfile for production builds
- [ ] Setup docker-compose.yml for full application stack
- [ ] Create docker-compose.dev.yml for development environment
- [ ] Create docker-compose.test.yml for isolated testing
- [ ] Update GitHub Actions to use Docker containers
- [ ] Setup MongoDB container with initialization scripts
- [ ] Configure environment variable management for containers
- [ ] Add container health checks and monitoring
- [ ] Create .dockerignore and optimize build contexts
- [ ] Document Docker development workflow

**Phase 3.5 Benefits for Testing:**
- Consistent test environments across all machines
- Real MongoDB integration tests (vs memory server)
- Parallel test execution in isolated containers
- Enhanced CI/CD reliability with container-based workflows
- **Total Tests**: 21 passing (5 test files)
- **Test Categories**: Utilities, Authentication Logic, Repository Logic, Custom Hooks (both useRequireAuth & useWindowSize)
- **TypeScript Compliance**: All tests properly typed with no 'any' violations
- **Execution Time**: 1.60 seconds for full test suite
- **Coverage**: High coverage on tested modules

### Phase 3.5: Dockerization & Container Strategy (Week 3)**

**🐳 Strategic Goal**: Containerize ForkSpy before expanding test suite for consistent environments

1. **Application Dockerization**
   ```dockerfile
   # Multi-stage build for production optimization
   # Development vs Production containers
   # Environment variable management
   ```

2. **Database Containerization**
   ```yaml
   # Docker Compose for MongoDB
   # Test database isolation
   # Data persistence strategies
   ```

3. **Development Environment**
   ```yaml
   # docker-compose.dev.yml - Development stack
   # Hot reload support
   # Volume mounting for live development
   ```

4. **Testing Environment Enhancement**
   ```yaml
   # docker-compose.test.yml - Testing stack
   # Isolated test databases
   # Parallel test execution containers
   ```

5. **CI/CD Integration**
   ```yaml
   # GitHub Actions with Docker
   # Container-based testing
   # Multi-stage builds
   # Container registry integration
   ```

**Phase 3.5 Benefits for Testing:**
- **Consistent Test Environment**: Same Node.js, MongoDB versions everywhere
- **Database Testing**: Real MongoDB for integration tests vs memory server
- **Parallel Testing**: Multiple isolated containers
- **CI/CD Reliability**: No environment drift issues
- **Easy Setup**: New developers get consistent environment

**Phase 3.5 Deliverables:**
- [ ] Multi-stage Dockerfile for production builds
- [ ] docker-compose.yml for full application stack
- [ ] docker-compose.dev.yml for development
- [ ] docker-compose.test.yml for testing environment
- [ ] Updated GitHub Actions to use containers
- [ ] Environment variable management strategy
- [ ] Database initialization scripts
- [ ] Container health checks and monitoring

### Phase 4 Tasks (Expand Testing + Enhanced CI/CD):
- [ ] Install additional dependencies (MSW, MongoDB Memory Server) - *Now with Docker integration*
- [ ] Setup comprehensive API mocking with containerized testing
- [ ] Write full API route test suite with real MongoDB containers
- [ ] Add parallel test execution using Docker containers
- [ ] Setup test matrix for multiple environments (Node.js versions in containers)
- [ ] Integration tests with full Docker stack

### Phase 5 Tasks (Component Testing):
- [ ] Setup React Testing Library
- [ ] Test core components (repo cards, hoverlay)
- [ ] Test UI components (buttons, cards, etc.)
- [ ] Add visual regression testing to CI/CD

### Phase 6 Tasks (Integration & Production):
- [ ] Test page components (dashboard, landing)
- [ ] Setup integration test workflows
- [ ] Add staging environment tests
- [ ] Configure deployment automation

## 🔄 **Iterative CI/CD Evolution**

### **Initial CI/CD (Phase 1-2)**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
```

### **Enhanced CI/CD (Phase 3-4)**
```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
      - name: Upload test results
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```

### **Production CI/CD (Phase 5-6)**
```yaml
name: Full CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20]
        os: [ubuntu-latest, windows-latest]
    steps:
      # ... test steps
      
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security audit
        run: npm audit --audit-level high
        
  deploy:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # ... deployment steps
```

## 💡 **Benefits of CI/CD First Approach**

1. **Immediate Feedback Loop**: Get testing feedback from day one
2. **Prevents Regression**: Catches issues early as you add more tests
3. **Team Confidence**: Everyone can see test status immediately
4. **Incremental Complexity**: Add advanced features gradually
5. **Documentation**: CI/CD serves as living documentation of your testing process
6. **Quality Gates**: Enforces quality standards from the beginning

## 📚 **Additional Resources**

### Vitest Configuration Example:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### Test Setup Example:
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

This plan provides a structured approach to implementing comprehensive testing for your ForkSpy application, ensuring reliability and maintainability as your codebase grows.