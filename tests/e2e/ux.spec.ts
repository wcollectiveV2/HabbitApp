import { test, expect } from '@playwright/test';
import { login } from './e2e-test-config';

test.describe('UX & UI Feedback', () => {
  test.beforeEach(async ({ page }) => {
    // Basic setup, but we might handle login per-test depending on scenario
    // For most, we need to be logged in
  });

  test.describe('UX-001: Loading States', () => {
    test('UX-001-01: Login button shows spinner during auth', async ({ page }) => {
      // Intentionally delay the login request
      await page.route('**/api/auth/login', async route => {
        await new Promise(f => setTimeout(f, 2000));
        await route.continue();
      });

      await page.goto('/login');
      // Fill login manually to test the specific button state
      await page.fill('input[type="email"]', 'testuser@example.com'); // Using dummy creds just to trigger request
      await page.fill('input[type="password"]', 'password123');
      
      const loginButton = page.locator('button[type="submit"]');
      await loginButton.click();
      
      // Check for spinner or loading state class
      // Note: Adjust selector based on actual implementation (e.g., .loading-spinner, or disabled state)
      await expect(loginButton).toBeDisabled();
      // Assume there's some visual indicator, checking disabled state is a good base
    });

    test('UX-001-02: Task list shows skeleton cards while loading', async ({ page }) => {
      await login(page);
      
      // Delay task fetch
      await page.route('**/api/tasks*', async route => {
        await new Promise(f => setTimeout(f, 2000));
        await route.continue();
      });
      
      await page.goto('/home');
      
      // Look for skeletons
      // Common pattern: elements with class 'animate-pulse' or 'skeleton'
      const skeletons = page.locator('.animate-pulse');
      await expect(skeletons.first()).toBeVisible();
    });

    test('UX-001-03: Challenges show skeleton cards while loading', async ({ page }) => {
      await login(page);
      
      // Delay challenges fetch
      await page.route('**/api/challenges*', async route => {
        await new Promise(f => setTimeout(f, 2000));
        await route.continue();
      });
      
      await page.goto('/discover');
      
      // Look for skeletons
      const skeletons = page.locator('.animate-pulse');
      await expect(skeletons.first()).toBeVisible();
    });
  });

  test.describe('UX-002: Error States', () => {
    test('UX-002-01: Login shows error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpass');
      await page.click('button[type="submit"]');
      
      // Expect error message
      await expect(
        page.locator('text=Invalid credentials')
          .or(page.locator('text=Login failed'))
          .or(page.locator('text=Invalid email or password'))
      ).toBeVisible({ timeout: 5000 });
    });

    test('UX-002-02: API failure shows error message', async ({ page }) => {
      await login(page);
      
      // Force API failure
      await page.route('**/api/tasks*', route => route.abort('failed'));
      
      await page.goto('/home');
      
      // Expect error toast or component
      // Using a text search for common error keywords
      await expect(page.locator('text=Error loading tasks').or(page.locator('text=Failed to load'))).toBeVisible();
    });
  });
});
