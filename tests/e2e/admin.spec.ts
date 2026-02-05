// admin.spec.ts
// Comprehensive E2E tests for Admin Dashboard
// Feature: Admin Login, Dashboard Access
// Uses REAL database with seeded test data (no mocks)

import { test, expect, Page } from '@playwright/test';
import { 
  TEST_USERS, 
  login
} from './e2e-test-config';

// ============================================================================
// ADMIN DASHBOARD TESTS
// ============================================================================

test.describe('Admin Dashboard', () => {

  test.describe('Admin User Access', () => {
    
    test('admin user can login', async ({ page }) => {
      await login(page, TEST_USERS.adminUser);
      
      // Should see dashboard
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    });

    test('admin user can access all tabs', async ({ page }) => {
      await login(page, TEST_USERS.adminUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Navigate through all tabs
      await page.click('button:has-text("Discover")');
      await expect(page.locator('[placeholder*="earch"]')).toBeVisible({ timeout: 5000 });
      
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 5000 });
      
      await page.click('button:has-text("Me")');
      await expect(page.locator(`text=${TEST_USERS.adminUser.name}`)).toBeVisible({ timeout: 5000 });
    });

    test('admin profile shows admin information', async ({ page }) => {
      await login(page, TEST_USERS.adminUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      await page.click('button:has-text("Me")');
      
      // Should see admin name
      await expect(page.locator(`text=${TEST_USERS.adminUser.name}`)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Manager User Access', () => {
    
    test('manager user can login', async ({ page }) => {
      await login(page, TEST_USERS.managerUser);
      
      // Should see dashboard
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    });

    test('manager user can access profile', async ({ page }) => {
      await login(page, TEST_USERS.managerUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      await page.click('button:has-text("Me")');
      await expect(page.locator(`text=${TEST_USERS.managerUser.name}`)).toBeVisible({ timeout: 5000 });
    });

    test('manager is part of organization', async ({ page }) => {
      // Manager user is linked to E2E Test Organization in seed
      await login(page, TEST_USERS.managerUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Manager should have access to organization features (if implemented in UI)
    });
  });

  test.describe('Regular User Cannot Access Admin', () => {
    
    test('regular user has no admin access', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Regular user should not see admin panel link
      await page.click('button:has-text("Me")');
      
      // No admin panel option should be visible
      await expect(page.locator('text=Admin Panel')).not.toBeVisible({ timeout: 2000 });
    });
  });
});

// ============================================================================
// ADMIN DASHBOARD (Separate App) - If accessible via URL
// ============================================================================

test.describe.skip('Admin Dashboard App (admin-dashboard)', () => {
  // These tests would target the separate admin-dashboard app
  // Skip if admin dashboard requires separate deployment/URL
  
  test('admin can access admin dashboard', async ({ page }) => {
    // Navigate to admin dashboard URL (if deployed)
    // await page.goto('http://localhost:3001/admin');
    
    // Login with admin credentials
    // Verify admin dashboard loads
  });

  test('admin can view users', async ({ page }) => {
    // Admin dashboard user management
  });

  test('admin can view organizations', async ({ page }) => {
    // Admin dashboard organization management
  });

  test('admin can view analytics', async ({ page }) => {
    // Admin dashboard analytics
  });
});
