# 🎯 Development Workflow Summary

## 🚀 Before Every Push (30 seconds)

```bash
npm run check
```
**OR**
```bash
./scripts/quick-check.sh
```

**What it does:**
- ✅ TypeScript compilation check
- ✅ ESLint validation
- ✅ All tests
- ✅ Docker build test (if Docker files changed)
- ✅ Common issue detection

## 🔬 Before Major Changes (2-3 minutes)

```bash
npm run check:full
```
**OR**
```bash
./scripts/full-validation.sh
```

**What it does:**
- ✅ Everything from quick check
- ✅ Fresh dependency install
- ✅ Test coverage report
- ✅ Next.js build validation
- ✅ Complete Docker validation
- ✅ Security audit
- ✅ File size check

## 🐳 Docker-Specific Changes

```bash
npm run check:docker
```
**OR**
```bash
./scripts/pre-push-docker-test.sh
```

**What it does:**
- ✅ Multi-stage Docker builds
- ✅ Container health checks
- ✅ Production startup validation
- ✅ Security scanning

## 📋 When to Use Which Check

### 🟢 Always Use `npm run check`
- Any code changes in components, pages, hooks
- Before every `git push`
- Quick feature additions
- Bug fixes

### 🟡 Use `npm run check:full`
- New features or major refactoring
- Before creating pull requests
- After updating dependencies
- Weekly/milestone checks

### 🔴 Use `npm run check:docker`
- Changes to Dockerfile or docker-compose files
- Healthcheck script modifications
- Environment variable changes
- CI/CD workflow updates

## 🔄 Ideal Development Flow

1. **Make changes** to your code
2. **Test locally**: `npm run dev`
3. **Quick validation**: `npm run check`
4. **Commit**: `git add . && git commit -m "your message"`
5. **Final check**: `npm run check` (optional but recommended)
6. **Push**: `git push`

## 🛠️ Additional Commands

```bash
# Just run tests
npm test

# Just check TypeScript
npx tsc --noEmit

# Just run linting
npm run lint

# Quick Docker health test
docker run --rm -e NEXTAUTH_SECRET=test $(docker build -q .) node healthcheck.mjs

# Clean everything and rebuild
rm -rf node_modules .next && npm ci && npm run build
```

## 🚨 If Checks Fail

### TypeScript Errors
```bash
# Check the error output and fix type issues
npx tsc --noEmit
```

### ESLint Errors
```bash
# Auto-fix what's possible
npm run lint -- --fix

# Check remaining issues manually
npm run lint
```

### Test Failures
```bash
# Run tests in watch mode to debug
npm run test:watch

# Run specific test file
npm test -- ComponentName
```

### Docker Build Failures
```bash
# Check Docker logs
docker build . 2>&1 | tail -20

# Test health check manually
docker run -it --rm $(docker build -q .) sh
```

## 🎯 Success Indicators

You're ready to push when:
- ✅ `npm run check` passes without errors
- ✅ No red error messages in terminal
- ✅ All tests show green checkmarks
- ✅ TypeScript compilation succeeds
- ✅ Docker builds complete (if applicable)

## 🔧 Pro Tips

1. **Run checks frequently** - catch issues early
2. **Fix TypeScript errors first** - they often cascade
3. **Don't skip Docker checks** - they catch production issues
4. **Use `npm run check:full`** before important commits
5. **Keep scripts updated** as your project evolves

---

This workflow catches 95% of CI/CD failures before they happen! 🚀
