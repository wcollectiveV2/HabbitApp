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
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test.describe('ADMIN-DASH-001: Statistics', () => {
    test('ADMIN-DASH-001-01: Total users count is displayed', async ({ page }) => {
      // Look for a stats card with "Total Users" or similar
      // And a number associated with it
      const usersCard = page.locator('text=Total Users').first();
      await expect(usersCard).toBeVisible();
      
      // Check for a number. Assuming the structure is Card -> Value
      // We can search for digits near the label
      await expect(page.locator('text=Total Users').locator('..').locator('text=/\\d+/')).toBeVisible();
    });

    test('ADMIN-DASH-001-02: Active protocols count is displayed', async ({ page }) => {
      const protocolsCard = page.locator('text=Active Protocols').first();
      await expect(protocolsCard).toBeVisible();
      await expect(page.locator('text=Active Protocols').locator('..').locator('text=/\\d+/')).toBeVisible();
    });

    test('ADMIN-DASH-001-03: System health indicators show status', async ({ page }) => {
      // Look for "System Health" or "Status" section
      // Should show things like "API: Online", "DB: Connected"
      await expect(page.locator('text=System Health').or(page.locator('text=System Status'))).toBeVisible();
      
      // Check for "Online" or "Healthy" tags
      await expect(page.locator('text=Online').first()).toBeVisible();
    });
  });
});
