import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from '../utils/test-utils';

/**
 * Authentication Tests
 * 
 * These tests verify the core authentication functionality of the application:
 * - Landing page navigation to sign-in
 * - Protected route redirects for unauthenticated users
 * - Authenticated session handling
 * 
 * The authentication mocking approach uses direct route interception and
 * localStorage/sessionStorage manipulation rather than trying to perform
 * an actual OAuth flow with GitHub.
 */
test.describe('Authentication Tests', () => {
  test('should display landing page and navigate to sign-in', async ({ page }) => {
    // Set a longer timeout for the test
    test.setTimeout(60000);
    
    // Navigate to the landing page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that the page title contains ForkSpy
    const title = await page.title();
    expect(title).toContain('ForkSpy');
    
    // Find and click the sign-in button on the landing page
    const signInButton = page.getByRole('link', { name: /Sign In with GitHub/i });
    await expect(signInButton).toBeVisible({ timeout: 15000 });
    
    // Take a screenshot before clicking
    await page.screenshot({ path: 'landing-page.png' });
    
    // Click the sign-in button
    await signInButton.click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the sign-in page
    await page.screenshot({ path: 'signin-page.png' });
    
    // Check that we're on the sign-in page
    // This should be a simple check for the GitHub button in the sign-in card
    const githubSignInButton = page.getByTestId('sign-in-button');
    await expect(githubSignInButton).toBeVisible({ timeout: 15000 });
  });

  test('should redirect to sign-in from protected route', async ({ page }) => {
    // Set a longer timeout for the test
    test.setTimeout(60000);
    
    // Try to access a protected route directly
    await page.goto('/dashboard');
    
    // Wait for the redirect to complete
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see where we ended up
    await page.screenshot({ path: 'protected-redirect.png' });
    
    // Verify we were redirected to sign-in page
    // URL should contain "signin"
    await expect(page).toHaveURL(/.*signin.*/, { timeout: 15000 });
    
    // The sign-in button should be visible
    const githubSignInButton = page.getByTestId('sign-in-button');
    await expect(githubSignInButton).toBeVisible({ timeout: 15000 });
  });
  
  test('should not redirect from dashboard with mocked auth', async ({ page }) => {
    // Set a longer timeout for the test
    test.setTimeout(60000);
    
    // Use the common auth mocking helper instead of direct code
    await mockAuthenticatedSession(page);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait to ensure client-side auth check completes
    
    // Take a screenshot to see the state
    await page.screenshot({ path: 'auth-test-dashboard.png' });
    
    // Check we're still on the dashboard URL and not redirected to signin
    const url = page.url();
    expect(url).toContain('/dashboard');
    expect(url).not.toContain('/signin');
  });
}); 