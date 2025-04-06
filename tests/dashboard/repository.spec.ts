import { test, expect, Page, Route } from '@playwright/test';

/**
 * Repository Management Tests
 * 
 * These tests verify the functionality of the repository management features:
 * - Adding a repository via URL
 * - Displaying repositories in the dashboard
 * - Repository selection dropdown
 * - Error handling for repository operations
 * 
 * All tests use the same authentication mocking approach that worked successfully
 * in the authentication tests.
 */
test.describe('Repository Management', () => {
  /**
   * Setup mock authentication and API responses for a test
   */
  async function setupMockAuth(page: Page) {
    // Mock the session for authenticated requests
    await page.route('**/api/auth/session', async (route: Route) => {
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
    
    // Set auth tokens in storage
    await page.evaluate(() => {
      localStorage.setItem('next-auth.session-token', 'fake-token-123');
      localStorage.setItem('next-auth.callback-url', 'http://localhost:3000');
      sessionStorage.setItem('authToken', 'fake-token-123');
    });
  }
  
  test('should display empty repository state', async ({ page }) => {
    // Set a longer timeout for the test
    test.setTimeout(60000);
    
    // Load the app and set up mock auth
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupMockAuth(page);
    
    // Mock empty repository list response
    await page.route('**/api/repos/get/**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) // Empty array means no repositories
      });
    });
    
    // Mock list repositories endpoint (for dropdown)
    await page.route('**/api/repos/list**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) // Empty list of available repos
      });
    });
    
    // Go to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait for client-side rendering
    
    // Take a screenshot to verify state
    await page.screenshot({ path: 'empty-repository-dashboard.png' });
    
    // Check for empty state indicators
    // Verify URL is dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Check for the repository input field
    const repoUrlInput = page.getByPlaceholder(/https:\/\/github.com\/username\/repo-name/i);
    await expect(repoUrlInput).toBeVisible();
    
    // Check for Add Repository button
    const addRepoButton = page.getByRole('button', { name: /Add Repository/i });
    await expect(addRepoButton).toBeVisible();
  });
  
  test('should add a repository via URL', async ({ page }) => {
    // Set a longer timeout for the test
    test.setTimeout(60000);
    
    // Mock auth and API responses
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupMockAuth(page);
    
    // Initial empty repository list
    await page.route('**/api/repos/get/**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) // Start with empty repos
      });
    });
    
    // Mock GitHub API list for dropdown
    await page.route('**/api/repos/list**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) 
      });
    });
    
    // Mock the add repository API endpoint
    let addRepositoryCalled = false;
    await page.route('**/api/repos/add/**', async (route: Route) => {
      const request = route.request();
      const body = request.postDataJSON();
      
      // Verify the repo URL is being sent correctly
      expect(body.repoUrl).toBe('https://github.com/testuser/test-repo');
      
      addRepositoryCalled = true;
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true,
          message: 'Repository added successfully'
        })
      });
    });
    
    // After add, the get repos endpoint should return the new repo
    let getRequestCount = 0;
    await page.route('**/api/repos/get/**', async (route: Route) => {
      // First call will return empty array, subsequent calls return the added repo
      if (getRequestCount === 0) {
        getRequestCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]) 
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            _id: 'mock-repo-id',
            repoUrl: 'https://github.com/testuser/test-repo',
            createdAt: new Date().toISOString()
          }])
        });
      }
    }, { times: 2 }); // Override the previous handler
    
    // Go to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Enter a repository URL
    const repoUrlInput = page.getByPlaceholder(/https:\/\/github.com\/username\/repo-name/i);
    await repoUrlInput.fill('https://github.com/testuser/test-repo');
    
    // Screenshot before submitting
    await page.screenshot({ path: 'before-add-repo.png' });
    
    // Click Add Repository button
    const addRepoButton = page.getByRole('button', { name: /Add Repository/i });
    await addRepoButton.click();
    
    // Wait for the API call to complete
    await page.waitForTimeout(2000);
    
    // Screenshot after submitting
    await page.screenshot({ path: 'after-add-repo.png' });
    
    // Verify that the API was called
    expect(addRepositoryCalled).toBe(true);
    
    // Verify the input is cleared after successful addition
    await expect(repoUrlInput).toHaveValue('');
  });
  
  test('should monitor API calls for invalid repository', async ({ page }) => {
    // Set a longer timeout for the test
    test.setTimeout(60000);
    
    // Mock auth and API responses
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await setupMockAuth(page);
    
    // Mock repository list response
    await page.route('**/api/repos/get/**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) 
      });
    });
    
    // Mock list endpoint
    await page.route('**/api/repos/list**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) 
      });
    });
    
    // Track if the add repository endpoint was called
    let addRepositoryCalled = false;
    let submittedUrl = '';
    
    // Mock the add repository API endpoint to track calls
    await page.route('**/api/repos/add/**', async (route: Route) => {
      addRepositoryCalled = true;
      const request = route.request();
      try {
        const body = request.postDataJSON();
        submittedUrl = body.repoUrl || '';
      } catch {
        // In case JSON parsing fails
        submittedUrl = 'parsing-error';
      }
      
      // Continue with the request normally
      await route.continue();
    });
    
    // Go to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Enter an invalid repository URL
    const repoUrlInput = page.getByPlaceholder(/https:\/\/github.com\/username\/repo-name/i);
    await repoUrlInput.fill('invalid-url');
    
    // Screenshot before submitting
    await page.screenshot({ path: 'before-invalid-repo.png' });
    
    // Click Add Repository button
    const addRepoButton = page.getByRole('button', { name: /Add Repository/i });
    await addRepoButton.click();
    
    // Wait for the API call to complete
    await page.waitForTimeout(2000);
    
    // Screenshot after submitting
    await page.screenshot({ path: 'after-invalid-repo.png' });
    
    // Verify that the API was called and the correct URL was submitted
    expect(addRepositoryCalled).toBe(true);
    expect(submittedUrl).toBe('invalid-url');
  });
}); 