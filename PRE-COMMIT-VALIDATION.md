# 🔍 Pre-Commit/Pre-Push Validation Guide

This guide ensures your code changes don't break anything before committing or pushing to prevent CI/CD failures.

## 🚀 Quick Pre-Push Check (30 seconds)

Run this **every time before `git push`**:

```bash
./scripts/quick-check.sh
```

## 🧪 Full Pre-Commit Validation (2-3 minutes)

Run this **before major commits or when unsure**:

```bash
./scripts/full-validation.sh
```

## 📋 Manual Step-by-Step Checks

### 1. 🔧 **Code Quality Checks** (Run First)

```bash
# Install dependencies (if package.json changed)
npm ci

# TypeScript compilation check
npx tsc --noEmit
echo "✅ TypeScript check passed"

# ESLint check
npm run lint
echo "✅ Linting passed"

# Prettier formatting check (if you have it)
npx prettier --check . || echo "⚠️  Consider running: npx prettier --write ."
```

### 2. 🧪 **Test Validation**

```bash
# Run all tests locally
npm test
echo "✅ All tests passed"

# Run tests with coverage
npm run test:coverage
echo "✅ Test coverage generated"

# Check test results
ls -la coverage/ test-results/ 2>/dev/null || echo "ℹ️  No test artifacts"
```

### 3. 🐳 **Docker Validation** (Critical for Docker changes)

```bash
# Quick Docker build test
docker build --target test -t forkspy-test-check . && echo "✅ Test image builds"

# Quick production build test
docker build -t forkspy-prod-check . && echo "✅ Production image builds"

# Quick health check
docker run -d --name health-check -e NEXTAUTH_SECRET=test -p 3010:3000 forkspy-prod-check
sleep 10
docker exec health-check node healthcheck.mjs && echo "✅ Health check works"
docker stop health-check && docker rm health-check

# Clean up
docker rmi forkspy-test-check forkspy-prod-check 2>/dev/null || true
```

### 4. 🔍 **Build Validation**

```bash
# Next.js build check
npm run build
echo "✅ Next.js build successful"

# Check if build artifacts exist
ls -la .next/ 2>/dev/null && echo "✅ Build artifacts created" || echo "❌ Build artifacts missing"
```

## 🔄 Automated Scripts

### Quick Check Script (`scripts/quick-check.sh`)

```bash
#!/bin/bash
set -e

echo "🚀 Quick pre-push validation..."
echo "================================"

# TypeScript check
echo "📝 Checking TypeScript..."
npx tsc --noEmit

# Linting
echo "🔍 Running ESLint..."
npm run lint

# Quick test run
echo "🧪 Running tests..."
npm test

# Quick Docker build test (if Dockerfile changed)
if git diff --cached --name-only | grep -q "Dockerfile\|docker-compose\|\.dockerignore"; then
    echo "🐳 Docker files changed - testing build..."
    docker build --target test -t quick-test . >/dev/null
    docker rmi quick-test >/dev/null
    echo "✅ Docker build test passed"
fi

echo "✅ Quick validation passed! Safe to push."
```

### Full Validation Script (`scripts/full-validation.sh`)

```bash
#!/bin/bash
set -e

echo "🔬 Full pre-commit validation..."
echo "================================"

# 1. Dependencies check
echo "📦 Checking dependencies..."
npm ci

# 2. TypeScript
echo "📝 TypeScript compilation..."
npx tsc --noEmit

# 3. Linting
echo "🔍 ESLint check..."
npm run lint

# 4. Tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage

# 5. Build check
echo "🏗️  Next.js build check..."
npm run build

# 6. Docker validation
echo "🐳 Docker validation..."
./scripts/pre-push-docker-test.sh

# 7. Security check (optional)
echo "🔒 Security audit..."
npm audit --audit-level moderate || echo "⚠️  Security issues found - review before pushing"

echo "🎉 Full validation passed! Code is ready for commit/push."
```

## 📂 When to Run Which Check

### 🟢 **Always Before Push** (Quick Check)
- Any code change in `src/`, `app/`, `components/`, `lib/`, `hooks/`
- Changes to `package.json`, `tsconfig.json`, or config files
- New dependencies added

### 🟡 **Before Major Commits** (Full Validation)
- New features or major refactoring
- Changes to Docker files or CI/CD workflows
- Database schema or API changes
- Before creating pull requests

### 🔴 **Critical - Must Run** (Full + Manual Review)
- Changes to `Dockerfile`, `docker-compose.yml`, or `.github/workflows/`
- Environment variable changes
- Security-related changes
- Production deployment changes

## 🚨 What Each Check Catches

### TypeScript Check
- ❌ Type errors
- ❌ Missing imports
- ❌ Invalid prop types
- ❌ Configuration issues

### ESLint Check
- ❌ Code style violations
- ❌ Potential bugs
- ❌ Unused variables
- ❌ Import/export issues

### Test Check
- ❌ Broken functionality
- ❌ Regression bugs
- ❌ API contract changes
- ❌ Component rendering issues

### Docker Check
- ❌ Build failures
- ❌ Missing dependencies
- ❌ Environment variable issues
- ❌ Health check failures

### Build Check
- ❌ Next.js compilation errors
- ❌ Missing static assets
- ❌ Route configuration issues
- ❌ Production build problems

## 🔧 Git Hooks (Optional Automation)

### Pre-commit Hook
Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "🔍 Running pre-commit checks..."

# Run quick validation
./scripts/quick-check.sh

if [ $? -ne 0 ]; then
    echo "❌ Pre-commit checks failed. Fix issues before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
```

### Pre-push Hook
Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "🚀 Running pre-push validation..."

# Check if Docker files changed
if git diff HEAD~1 --name-only | grep -q "Dockerfile\|docker-compose\|healthcheck"; then
    echo "🐳 Docker changes detected - running full Docker validation..."
    ./scripts/pre-push-docker-test.sh
fi

echo "✅ Pre-push validation passed!"
```

Make hooks executable:
```bash
chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

## 📱 IDE Integration

### VS Code Settings
Add to `.vscode/settings.json`:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "eslint.validate": ["typescript", "typescriptreact"]
}
```

### VS Code Tasks
Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Quick Check",
      "type": "shell",
      "command": "./scripts/quick-check.sh",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## 🎯 Success Criteria

Before pushing, ensure:
- ✅ All TypeScript errors resolved
- ✅ All ESLint warnings addressed
- ✅ All tests passing locally
- ✅ Docker builds successfully
- ✅ Health checks working
- ✅ No console errors in dev mode
- ✅ Build completes without warnings

## ⚡ Quick Commands Reference

```bash
# Super quick check (30 seconds)
npm run lint && npm test

# Docker-specific check (if you changed Docker files)
docker build . && docker run --rm -e NEXTAUTH_SECRET=test $(docker build -q .) node healthcheck.mjs

# Full validation (2-3 minutes)
npm run lint && npm test && npm run build && ./scripts/pre-push-docker-test.sh

# Clean slate test (if you want to be 100% sure)
rm -rf node_modules .next && npm ci && npm run build && npm test
```

## 🔄 Integration with Development Workflow

1. **Make code changes**
2. **Test in dev mode**: `npm run dev`
3. **Run quick check**: `./scripts/quick-check.sh`
4. **If Docker files changed**: `./scripts/pre-push-docker-test.sh`
5. **Commit**: `git commit -m "feat: your changes"`
6. **Final check**: `./scripts/quick-check.sh`
7. **Push**: `git push`

This workflow catches 95% of issues before they reach CI/CD! 🚀
