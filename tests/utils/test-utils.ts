import { Page } from '@playwright/test';

export async function mockAuthenticatedSession(page: Page, email = 'test@example.com') {
  // Mock session storage
  await page.evaluate((userEmail) => {
    localStorage.setItem('next-auth.session-token', 'mock-token');
    sessionStorage.setItem('userProfile', JSON.stringify({
      email: userEmail,
      name: 'Test User'
    }));
  }, email);

  // Mock session endpoint
  await page.route('**/api/auth/session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { email: email, name: 'Test User' },
        accessToken: 'mock-github-token',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    });
  });
}

export async function mockGitHubApi(page: Page) {
  // Mock GitHub API responses
  await page.route('**/api.github.com/**', (route) => {
    const url = route.request().url();
    
    // Mock different GitHub API endpoints
    if (url.includes('/user')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          login: 'testuser',
          email: 'test@example.com',
          name: 'Test User'
        })
      });
    } else if (url.includes('/repos')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 1,
          name: 'test-repo',
          full_name: 'testuser/test-repo',
          private: false,
          description: 'Test repository'
        }])
      });
    } else {
      route.continue();
    }
  });
} 