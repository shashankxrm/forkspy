import { test, expect } from '@playwright/test';

test.describe('Test Environment Setup', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    await expect(page.getByRole('heading', { name: /Know When Your Repos Get Forked/i })).toBeVisible();
    
    // Check for sign-in button
    await expect(page.getByRole('link', { name: /Sign In with GitHub/i })).toBeVisible();
  });

  test('should handle theme switching', async ({ page }) => {
    // Navigate to the page and wait for it to be ready
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Log initial state
    const initialState = await page.evaluate(() => ({
      theme: localStorage.getItem('forkspy-theme'),
      classes: document.documentElement.className,
      buttonText: document.querySelector('button[aria-label="Toggle theme"]')?.textContent
    }));
    console.log('Initial state:', initialState);
    
    // Wait for theme toggle to be ready
    const themeToggle = page.getByRole('button', { name: /Toggle theme/i });
    await expect(themeToggle).toBeVisible();
    
    // Click the theme toggle
    await themeToggle.click();
    
    // Wait a bit for the theme to update
    await page.waitForTimeout(1000);
    
    // Log final state
    const finalState = await page.evaluate(() => ({
      theme: localStorage.getItem('forkspy-theme'),
      classes: document.documentElement.className,
      buttonText: document.querySelector('button[aria-label="Toggle theme"]')?.textContent
    }));
    console.log('Final state:', finalState);
    
    // Basic verification that something changed
    expect(finalState.theme).toBeDefined();
    expect(finalState.theme).not.toBe(initialState.theme);
    
    // If we started with no theme or system theme, we should now have either light or dark
    if (!initialState.theme || initialState.theme === 'system') {
      expect(['light', 'dark']).toContain(finalState.theme);
    }
    // If we started with light or dark, we should have switched to the opposite
    else {
      expect(finalState.theme).toBe(initialState.theme === 'dark' ? 'light' : 'dark');
    }
  });
}); 