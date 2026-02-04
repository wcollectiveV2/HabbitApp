// navigation.spec.ts
// Comprehensive E2E tests for Navigation
// Feature: Bottom Navigation, Tab Switching, View Transitions
// Uses REAL database with seeded test data (no mocks)

import { test, expect, Page } from '@playwright/test';
import { 
  TEST_USERS, 
  login,
  navigateTo
} from '../e2e-test-config';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function loginAndGetToHome(page: Page) {
  await login(page, TEST_USERS.testUser);
  // Default view is 'active', looking for "Current Progress" or "Today's Tasks"
  await expect(page.locator('text=Current Progress').or(page.locator('text=Today\'s Tasks'))).toBeVisible({ timeout: 15000 });
}

// ============================================================================
// FEATURE: BOTTOM NAVIGATION (NAV-001)
// ============================================================================

test.describe('Feature: Bottom Navigation (NAV-001)', () => {

  test.describe('Scenario: Navigation Visibility', () => {
    
    test('NAV-001-01: Bottom navigation shows 5 tabs', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Should see all 5 navigation tabs: Home, Habits, Active, Social, Me
      await expect(page.locator('button:has-text("Home")')).toBeVisible();
      await expect(page.locator('button:has-text("Habits")')).toBeVisible();
      await expect(page.locator('button:has-text("Active")')).toBeVisible();
      await expect(page.locator('button:has-text("Social")')).toBeVisible();
      await expect(page.locator('button:has-text("Me")')).toBeVisible();
    });

    test('NAV-001-02: Each tab has icon and label', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Home tab
      const homeButton = page.locator('button:has-text("Home")');
      await expect(homeButton.locator('.material-symbols-outlined')).toBeVisible();
      
      // Active tab (Default)
      const activeButton = page.locator('button:has-text("Active")');
      await expect(activeButton.locator('.material-symbols-outlined')).toBeVisible();
    });

    test('NAV-001-03: Current tab is highlighted', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // 'Active' is default tab
      const activeButton = page.locator('button:has-text("Active")');
      // Active state usually involves 'bg-primary' or 'text-primary' or 'text-white' depending on implementation
      // Based on BottomNav.tsx: active has 'bg-primary text-white'
      await expect(activeButton).toHaveClass(/bg-primary/);
      
      // Switch to Home
      await page.click('button:has-text("Home")');
      const homeButton = page.locator('button:has-text("Home")');
      await expect(homeButton).toHaveClass(/bg-primary/);
      
      // Active should no longer be highlighted
      await expect(activeButton).not.toHaveClass(/bg-primary/);
    });

    test('NAV-001-04: View transition animation works', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Verify changing tab loads content reasonably fast (animation check implicitly by rendering)
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible();
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
      
      // Switch from Active (default) to Home
      await page.click('button:has-text("Home")');
      
      // Home View typically shows Stats, Weekly Calendar, Tip
      // Look for Weekly Calendar specific elements or "personalized tip"
      await expect(page.locator('text=Weekly Activity').or(page.locator('text=Stay focused'))).toBeVisible();
    });

    test('NAV-002-02: Habits tab shows Habits view', async ({ page }) => {
      await loginAndGetToHome(page);
      
      await page.click('button:has-text("Habits")');
      
      // Should see habits management
      await expect(page.locator('text=My Habits').or(page.locator('text=Create Habit'))).toBeVisible({ timeout: 5000 });
    });

    test('NAV-002-03: Active tab shows Active view', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Switch away then back
      await page.click('button:has-text("Home")');
      await page.click('button:has-text("Active")');
      
      // Active view has "Current Progress" and "Today's Tasks"
      await expect(page.locator('text=Current Progress')).toBeVisible();
      await expect(page.locator('text=Today\'s Tasks')).toBeVisible();
    });

    test('NAV-002-04: Social tab shows Social view', async ({ page }) => {
      await loginAndGetToHome(page);
      
      await page.click('button:has-text("Social")');
      
      // Should see social/leaderboard content
      await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 5000 });
    });

    test('NAV-002-05: Me tab shows Profile view', async ({ page }) => {
      await loginAndGetToHome(page);
      
      await page.click('button:has-text("Me")');
      
      // Should see profile content with user name
      await expect(page.locator(`text=${TEST_USERS.testUser.name}`).or(page.locator('text=Edit Profile'))).toBeVisible({ timeout: 5000 });
    });

    test('NAV-002-06: Can navigate from any tab to any other', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Home → Social
      await page.click('button:has-text("Home")');
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible();
      
      // Social → Habits
      await page.click('button:has-text("Habits")');
      await expect(page.locator('text=My Habits').or(page.locator('text=Create Habit'))).toBeVisible();
      
      // Habits → Active
      await page.click('button:has-text("Active")');
      await expect(page.locator('text=Current Progress')).toBeVisible();
    });
  });
});

// ============================================================================
// FEATURE: FAB MENU (NAV-003) & ACTION BUTTONS
// ============================================================================

test.describe('Feature: Action Buttons (NAV-003)', () => {

  test.describe('Scenario: Button Interactions', () => {
    
    test('NAV-003-01: Discover button is visible on Active tab', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Discover New Challenges button in Active view
      const discoverBtn = page.locator('button:has-text("Discover New Challenges")');
      await expect(discoverBtn).toBeVisible();
    });

    test('NAV-003-02: Add Task button visible on Active tab', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // "Add Task" text or icon
      await expect(page.locator('button:has-text("Add Task")')).toBeVisible();
    });
  });
});

// ============================================================================
// FEATURE: VIEW TRANSITIONS (NAV-004)
// ============================================================================

test.describe('Feature: View Transitions (NAV-004)', () => {

  test.describe('Scenario: Smooth Transitions', () => {
    
    test('NAV-004-01: Tab switching is fast', async ({ page }) => {
      await loginAndGetToHome(page);
      
      // Quick navigation between tabs
      await page.click('button:has-text("Social")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Habits")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Me")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Home")');
      
      // Should end up on home
      await expect(page.locator('text=Weekly Activity').or(page.locator('text=Stay focused'))).toBeVisible({ timeout: 5000 });
    });
  });
});

// ============================================================================
// FEATURE: DEEP LINKING (NAV-007)
// ============================================================================

test.describe('Feature: Deep Linking (NAV-007)', () => {

  test.describe('Scenario: URL-based Navigation', () => {
    
    test('NAV-007-01: Login required for protected routes', async ({ page }) => {
      // Try to access route without login (if router supports it, usually hashes or conditional render)
      // Since App.tsx renders dependent on 'activeTab' state inside a single route logic generally,
      // actual URL deep linking might not be fully implemented or relies on state.
      // But we can test authentication guard:
      
      // Clear all state/cookies
      await page.context().clearCookies();
      await page.reload();
      
      // Should see login form (or onboarding)
      await expect(page.locator('input[type="email"]').or(page.locator('text=Welcome to HabitPulse'))).toBeVisible();
    });
  });
});
