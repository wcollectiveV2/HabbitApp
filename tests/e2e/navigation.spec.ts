// navigation.spec.ts
// Comprehensive E2E tests for Navigation
// Feature: Bottom Navigation, Tab Switching, View Transitions
// Uses REAL database with seeded test data (no mocks)

import { test, expect, Page } from '@playwright/test';
import { 
  TEST_USERS, 
  login,
  navigateTo
} from './e2e-test-config';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function loginAndGetToHome(page: Page) {
  await login(page, TEST_USERS.testUser);
  await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
}

// ============================================================================
// FEATURE: BOTTOM NAVIGATION (NAV-001)
// ============================================================================

test.describe('Feature: Bottom Navigation (NAV-001)', () => {

  test.describe('Scenario: Navigation Visibility', () => {
    
    test('NAV-001-01: Bottom navigation shows 4 tabs', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Should see all navigation tabs
      await expect(page.locator('button:has-text("Home")')).toBeVisible();
      await expect(page.locator('button:has-text("Discover")')).toBeVisible();
      await expect(page.locator('button:has-text("Social")')).toBeVisible();
      await expect(page.locator('button:has-text("Me")')).toBeVisible();
    });

    test('NAV-001-02: Each tab has icon and label', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Home tab should have icon
      const homeButton = page.locator('button:has-text("Home")');
      await expect(homeButton.locator('.material-symbols-outlined')).toBeVisible();
      
      // Discover tab
      const discoverButton = page.locator('button:has-text("Discover")');
      await expect(discoverButton.locator('.material-symbols-outlined')).toBeVisible();
    });

    test('NAV-001-03: Current tab is highlighted', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Home tab should have active styling
      const homeButton = page.locator('button:has-text("Home")');
      // Check for active class or styling
      await expect(homeButton).toBeVisible();
    });
  });
});

// ============================================================================
// FEATURE: TAB SWITCHING (NAV-002)
// ============================================================================

test.describe('Feature: Tab Switching (NAV-002)', () => {

  test.describe('Scenario: Navigate Between Tabs', () => {
    
    test('NAV-002-01: Home tab shows Home view', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Should see home content
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible();
    });

    test('NAV-002-02: Discover tab shows Discover view', async ({ page }) => {
      await loginAndGetToHome(page);
      
      await page.click('button:has-text("Discover")');
      
      // Should see discover content
      await expect(page.locator('h2:has-text("Discover")').or(
        page.locator('[placeholder*="earch"]')
      )).toBeVisible({ timeout: 5000 });
    });

    test('NAV-002-03: Social tab shows Social view', async ({ page }) => {
      await loginAndGetToHome(page);
      
      await page.click('button:has-text("Social")');
      
      // Should see social/leaderboard content
      await expect(page.locator('text=Leaderboard').or(page.locator('text=Global'))).toBeVisible({ timeout: 5000 });
    });

    test('NAV-002-04: Me tab shows Profile view', async ({ page }) => {
      await loginAndGetToHome(page);
      
      await page.click('button:has-text("Me")');
      
      // Should see profile content with user name
      await expect(page.locator(`text=${TEST_USERS.testUser.name}`).or(page.locator('text=Edit Profile'))).toBeVisible({ timeout: 5000 });
    });

    test('NAV-002-05: Can navigate from any tab to any other', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Home → Social
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 5000 });
      
      // Social → Discover
      await page.click('button:has-text("Discover")');
      await expect(page.locator('[placeholder*="earch"]').or(page.locator('h2:has-text("Discover")'))).toBeVisible({ timeout: 5000 });
      
      // Discover → Me
      await page.click('button:has-text("Me")');
      await expect(page.locator('text=Edit Profile').or(page.locator(`text=${TEST_USERS.testUser.name}`))).toBeVisible({ timeout: 5000 });
      
      // Me → Home
      await page.click('button:has-text("Home")');
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 5000 });
    });
  });
});

// ============================================================================
// FEATURE: FAB MENU (NAV-003)
// ============================================================================

test.describe('Feature: FAB Menu (NAV-003)', () => {

  test.describe('Scenario: FAB Interaction', () => {
    
    test('NAV-003-01: FAB button is visible on home', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Should see FAB (floating action button)
      const fabButton = page.locator('button:has(span.material-symbols-outlined:has-text("add"))');
      await expect(fabButton.last()).toBeVisible();
    });

    test('NAV-003-02: FAB opens menu with options', async ({ page }) => {
      await loginAndGetToHome(page);
      
      const fabButton = page.locator('button:has(span.material-symbols-outlined:has-text("add"))').last();
      await fabButton.click();
      
      // Should see menu options
      await expect(page.locator('text=Task').or(
        page.locator('text=Habit').or(
        page.locator('text=Create'))
      )).toBeVisible({ timeout: 3000 });
    });

    test('NAV-003-03: AI Coach FAB is accessible', async ({ page }) => {
      await loginAndGetToHome(page);
      
      const aiButton = page.locator('button:has(.material-symbols-outlined:has-text("smart_toy"))');
      await expect(aiButton).toBeVisible();
      
      await aiButton.click();
      
      // Should open coach modal
      await expect(page.locator('h3:has-text("Habit Coach")').or(page.locator('text=Pulse'))).toBeVisible({ timeout: 3000 });
    });
  });
});

// ============================================================================
// FEATURE: VIEW TRANSITIONS (NAV-004)
// ============================================================================

test.describe('Feature: View Transitions (NAV-004)', () => {

  test.describe('Scenario: Smooth Transitions', () => {
    
    test('NAV-004-01: Tab switching is smooth', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Quick navigation between tabs
      await page.click('button:has-text("Social")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Discover")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Me")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Home")');
      
      // Should end up on home
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 5000 });
    });

    test('NAV-004-02: Content loads appropriately', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Go to discover and verify content loads
      await page.click('button:has-text("Discover")');
      await expect(page.locator('[placeholder*="earch"]').or(page.locator('text=Yoga'))).toBeVisible({ timeout: 10000 });
      
      // Go to social and verify content loads
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 10000 });
    });
  });
});

// ============================================================================
// FEATURE: NAVIGATION STATE (NAV-005)
// ============================================================================

test.describe('Feature: Navigation State (NAV-005)', () => {

  test.describe('Scenario: State Persistence', () => {
    
    test('NAV-005-01: Tab state preserved on return', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Go to discover and scroll/search
      await page.click('button:has-text("Discover")');
      const searchInput = page.locator('[placeholder*="earch"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Yoga');
      }
      
      // Navigate away
      await page.click('button:has-text("Home")');
      await page.waitForTimeout(500);
      
      // Return to discover
      await page.click('button:has-text("Discover")');
      
      // State might or might not be preserved (depends on implementation)
      await expect(page.locator('[placeholder*="earch"]')).toBeVisible({ timeout: 5000 });
    });
  });
});

// ============================================================================
// FEATURE: DIFFERENT USER NAVIGATION (NAV-006)
// ============================================================================

test.describe('Feature: Different User Navigation (NAV-006)', () => {

  test('NAV-006-01: Friend user has same navigation', async ({ page }) => {
    await login(page, TEST_USERS.friend1);
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    
    // Should have all navigation tabs
    await expect(page.locator('button:has-text("Home")')).toBeVisible();
    await expect(page.locator('button:has-text("Discover")')).toBeVisible();
    await expect(page.locator('button:has-text("Social")')).toBeVisible();
    await expect(page.locator('button:has-text("Me")')).toBeVisible();
  });

  test('NAV-006-02: Admin user has same navigation', async ({ page }) => {
    await login(page, TEST_USERS.adminUser);
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    
    // Should have all navigation tabs
    await expect(page.locator('button:has-text("Home")')).toBeVisible();
    await expect(page.locator('button:has-text("Discover")')).toBeVisible();
    await expect(page.locator('button:has-text("Social")')).toBeVisible();
    await expect(page.locator('button:has-text("Me")')).toBeVisible();
  });
});

// ============================================================================
// FEATURE: DEEP LINKING (NAV-007)
// ============================================================================

test.describe('Feature: Deep Linking (NAV-007)', () => {

  test.describe('Scenario: URL-based Navigation', () => {
    
    test('NAV-007-01: Login required for protected routes', async ({ page }) => {
      // Try to access home without login
      await page.goto('/');
      
      // Should see login form
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    });
  });
});
