# ForkSpy Test Suite

This directory contains end-to-end tests for the ForkSpy application using Playwright.

## Test Structure

The tests are organized by feature:

- `auth/` - Authentication tests
- `dashboard/` - Dashboard and repository management tests
- `setup/` - Application setup and environment tests
- `utils/` - Shared test utilities

## Authentication Mocking Approach

Since the application uses GitHub OAuth for authentication, we use a mocking approach for tests:

1. **Direct API Mocking**: We intercept calls to `/api/auth/session` and other auth endpoints using Playwright's `page.route()` method.

2. **LocalStorage/SessionStorage**: We directly set authentication tokens in the browser's storage to simulate an authenticated session.

3. **GitHub API Mocking**: We mock calls to GitHub API endpoints to avoid actual API usage during tests.

Example:

```typescript
// Set up mock authentication
await page.route('**/api/auth/session', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      user: { 
        email: 'test@example.com', 
        name: 'Test User' 
      },
      accessToken: 'mock-token-123',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  });
});

// Set auth tokens
await page.evaluate(() => {
  localStorage.setItem('next-auth.session-token', 'fake-token-123');
  localStorage.setItem('next-auth.callback-url', 'http://localhost:3000');
  sessionStorage.setItem('authToken', 'fake-token-123');
});
```

## Best Practices

1. **Incremental Testing**: Add one test at a time and verify it passes before adding more complexity.

2. **Independent Tests**: Each test should set up its own environment and not depend on previous tests.

3. **Meaningful Screenshots**: Take screenshots at key points to help debug test failures.

4. **Error Handling**: Test both happy paths and error scenarios.

5. **Test Specific UI Elements**: Use specific selectors where possible (data-testid attributes are preferred).

## Running Tests

To run all tests:

```bash
npx playwright test
```

To run a specific test file:

```bash
npx playwright test tests/auth/authentication.spec.ts
```

To run in debug mode:

```bash
npx playwright test --debug
```

## Adding New Tests

When adding new tests:

1. Keep tests focused on specific features or user stories
2. Reuse the authentication mocking approach
3. Mock API endpoints that aren't directly being tested
4. Add appropriate assertions to verify behavior

## Maintaining Tests

If tests start failing after application changes:

1. Check if selectors need to be updated
2. Verify that mocked API responses match current application expectations
3. Update screenshots to reflect the new UI 