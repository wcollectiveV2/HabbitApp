import { test, expect } from '@playwright/test';
import { TEST_USERS } from './e2e-test-config';
import { ADMIN_DASHBOARD_URL } from './constants';

test.describe('Admin Dashboard', () => {
  test.use({ baseURL: ADMIN_DASHBOARD_URL });

  test.beforeEach(async ({ page }) => {
    // Perform login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.adminUser.email);
    await page.fill('input[type="password"]', TEST_USERS.adminUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test.describe('ADMIN-DASH-001: Statistics', () => {
    test('ADMIN-DASH-001-01: Total users count is displayed', async ({ page }) => {
      // Look for a stats card with "Total Users"
      await expect(page.locator('text=Total Users')).toBeVisible();
      
      // Check for the value associated with it (large text in the same card)
      // We look for the parent card, then the value
      const card = page.locator('.p-5', { has: page.locator('text=Total Users') });
      await expect(card.locator('.text-2xl')).toBeVisible();
      await expect(card.locator('.text-2xl')).toHaveText(/^\d+,?\d*$/);
    });

    test('ADMIN-DASH-001-02: Active Challenges count is displayed', async ({ page }) => {
      const card = page.locator('.p-5', { has: page.locator('text=Active Challenges') });
      await expect(card).toBeVisible();
      await expect(card.locator('.text-2xl')).toBeVisible();
      await expect(card.locator('.text-2xl')).toHaveText(/^\d+$/);
    });

    test('ADMIN-DASH-001-03: System health indicators show status', async ({ page }) => {
      // Look for "System Health" or "Status" section
      // Should show things like "System Health"
      await expect(page.locator('text=System Health').or(page.locator('text=System Status'))).toBeVisible();
      
      // Check for "Operational" tag (used in DashboardView.tsx)
      await expect(page.locator('text=Operational').first()).toBeVisible();
    });
  });
});
