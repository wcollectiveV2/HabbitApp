import { test, expect } from '@playwright/test';
import { TEST_USERS } from './e2e-test-config';
import { ADMIN_DASHBOARD_URL } from './constants';

test.describe('Admin Authentication', () => {
  // Use admin dashboard URL for these tests
  test.use({ baseURL: ADMIN_DASHBOARD_URL });

  test('ADMIN-AUTH-001-01: Admin can log in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.adminUser.email);
    await page.fill('input[type="password"]', TEST_USERS.adminUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    // Check for dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('ADMIN-AUTH-001-02: Non-admin users are rejected', async ({ page }) => {
    await page.goto('/login');
    // Using a regular user credentials
    await page.fill('input[type="email"]', TEST_USERS.testUser.email);
    await page.fill('input[type="password"]', TEST_USERS.testUser.password);
    await page.click('button[type="submit"]');

    // Expect error message or stay on login
    // Note: The specific error message depends on implementation, adjusting to common patterns
    await expect(page.locator('text=Access denied').or(page.locator('text=Unauthorized'))).toBeVisible();
    await expect(page).toHaveURL(/.*\/login/); 
  });

  test('ADMIN-AUTH-001-03: Protected routes redirect to login', async ({ page }) => {
    // Try to go directly to dashboard without login
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('ADMIN-AUTH-001-04: Logout clears session', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.adminUser.email);
    await page.fill('input[type="password"]', TEST_USERS.adminUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Find and click logout
    // Usually in a user menu or header
    // Ideally we'd use a more stable selector if known, guessing 'Logout' text or button
    await page.click('text=Logout'); // Or selector for user menu then logout
    
    // Should return to login
    await expect(page).toHaveURL(/.*\/login/);
    
    // Trying to access dashboard again should fail
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
