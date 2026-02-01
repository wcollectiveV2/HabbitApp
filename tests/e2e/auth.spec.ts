import { test, expect } from '@playwright/test';
import { mockAuthResponse } from './mocks';

test.describe('Authentication', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock the API requests
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({ json: mockAuthResponse });
    });
    
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({ json: mockAuthResponse });
    });
    
    // Mock get user profile if called after login
    await page.route('**/api/users/me', async route => {
        await route.fulfill({ json: mockAuthResponse.user });
    });

    // Mock initial data fetching to avoid errors
    await page.route('**/api/tasks', async route => {
        await route.fulfill({ json: [] });
    });
    await page.route('**/api/challenges/my', async route => {
        await route.fulfill({ json: [] });
    });
    
    await page.goto('/');
  });

  test('should allow a user to sign up', async ({ page }) => {
    // Switch to Signup - assuming "Sign Up" button text exists
    // Based on LoginView.tsx: <button onClick={onSwitchToSignup} ...>Sign Up</button>
    await page.click('button:has-text("Sign Up")');
    
    // Check if we are on Signup page
    await expect(page.locator('h1')).toContainText('Create Account');
    
    // Fill form
    await page.fill('input[placeholder="Alex Rivera"]', 'Test User');
    await page.fill('input[placeholder="alex@example.com"]', 'test@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    
    // Check terms
    await page.check('input[type="checkbox"]');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirection to home/dashboard
    await expect(page.locator('text=Current Progress')).toBeVisible();
  });

  test('should allow a user to login', async ({ page }) => {
    // Fill form
    await page.fill('input[placeholder="alex@example.com"]', 'test@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirection to home/dashboard
    await expect(page.locator('text=Current Progress')).toBeVisible();
  });
});
