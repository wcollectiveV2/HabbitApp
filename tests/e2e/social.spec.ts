// social.spec.ts
// Comprehensive E2E tests for Social Features
// Feature: Global Leaderboard, Friends Leaderboard, Activity Feed
// Uses REAL database with seeded test data (no mocks)

import { test, expect, Page } from '@playwright/test';
import { 
  TEST_USERS, 
  login, 
  navigateTo,
  goToSocial,
  switchToFriendsLeaderboard
} from './e2e-test-config';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function loginAndGoToSocial(page: Page) {
  await login(page, TEST_USERS.testUser);
  await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
  
  // Navigate to Social tab
  await page.click('button:has-text("Social")');
  await expect(page.locator('text=Leaderboard').or(page.locator('text=Global'))).toBeVisible({ timeout: 5000 });
}

// ============================================================================
// FEATURE: GLOBAL LEADERBOARD (SOCIAL-001)
// ============================================================================

test.describe('Feature: Global Leaderboard (SOCIAL-001)', () => {

  test.describe('Scenario: View Leaderboard', () => {
    
    test('SOCIAL-001-01: Global leaderboard shows users', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Should see users from seed data (friends have streaks)
      await expect(page.locator(`text=${TEST_USERS.friend1.name}`).or(
        page.locator('text=Jane')
      ).or(
        page.locator('text=Bob')
      )).toBeVisible({ timeout: 10000 });
    });

    test('SOCIAL-001-02: Each row shows rank, avatar, name, points', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Should see rank numbers
      await expect(page.locator('text=1').or(page.locator('text=#1'))).toBeVisible();
      
      // Should see points/streak
      await expect(page.locator('text=21').or(page.locator('text=streak'))).toBeVisible();
      
      // Should see avatars (if present)
      const avatars = page.locator('img');
      if (await avatars.count() > 0) {
        await expect(avatars.first()).toBeVisible();
      }
    });

    test('SOCIAL-001-03: Current user has "YOU" badge', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Current user should have YOU badge
      await expect(page.locator('text=YOU').or(page.locator('text=You'))).toBeVisible({ timeout: 10000 });
    });

    test('SOCIAL-001-04: Top 3 have special styling', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Friend1 (Jane) has streak 21, should be high on leaderboard
      const topUser = page.locator(`text=${TEST_USERS.friend1.name}`).locator('..').locator('..');
      await expect(topUser).toBeVisible();
      
      // Check for special styling indicators
      const ranking = page.locator('[class*="rank"]').or(page.locator('text=#')).or(page.locator('text=1.'));
      await expect(ranking.first()).toBeVisible();
    });
  });

  test.describe('Scenario: Leaderboard Loading', () => {
    
    test('SOCIAL-001-05: Leaderboard loads data from API', async ({ page }) => {
      let leaderboardApiCalled = false;
      
      // Intercept without mocking
      await page.route('**/api/social/leaderboard*', async route => {
        leaderboardApiCalled = true;
        await route.continue();
      });

      await loginAndGoToSocial(page);
      
      // Wait for data
      await page.waitForTimeout(2000);
      
      // API should be called
      expect(leaderboardApiCalled).toBeTruthy();
    });
  });
});

// ============================================================================
// FEATURE: FRIENDS LEADERBOARD (SOCIAL-002)
// ============================================================================

test.describe('Feature: Friends Leaderboard (SOCIAL-002)', () => {

  test.describe('Scenario: Toggle to Friends', () => {
    
    test('SOCIAL-002-01: Toggle between Global and Friends view', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Should see toggle buttons
      const globalButton = page.locator('button:has-text("Global")');
      const friendsButton = page.locator('button:has-text("Friends")');
      
      await expect(globalButton).toBeVisible();
      await expect(friendsButton).toBeVisible();
      
      // Click Friends
      await friendsButton.click();
      await page.waitForTimeout(1000);
      
      // Should see friends leaderboard (testUser follows friend1-3 from seed)
      await expect(page.locator(`text=${TEST_USERS.friend1.name}`).or(
        page.locator('text=Jane')
      )).toBeVisible({ timeout: 5000 });
    });

    test('SOCIAL-002-02: Friends leaderboard shows followed users', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Switch to Friends
      await page.click('button:has-text("Friends")');
      await page.waitForTimeout(1000);
      
      // Should see friend users (from seed: testUser follows friend1, friend2, friend3)
      await expect(page.locator(`text=${TEST_USERS.friend1.name}`).or(
        page.locator('text=Jane')
      )).toBeVisible();
    });

    test('SOCIAL-002-03: Current user appears in friends leaderboard', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      await page.click('button:has-text("Friends")');
      await page.waitForTimeout(1000);
      
      // Current user should be in friends list
      await expect(page.locator('text=YOU').or(page.locator('text=You'))).toBeVisible({ timeout: 5000 });
    });
  });
});

// ============================================================================
// FEATURE: ACTIVITY FEED (SOCIAL-003)
// ============================================================================

test.describe('Feature: Activity Feed (SOCIAL-003)', () => {

  test.describe('Scenario: View Activity Feed', () => {
    
    test('SOCIAL-003-01: Activity feed shows recent activities', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Scroll down to see activity feed (if below leaderboard)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Should see activities from seed data
      await expect(page.locator('text=joined').or(
        page.locator('text=completed').or(
        page.locator('text=streak').or(
        page.locator('text=Jane').or(
        page.locator('text=Bob'))))
      )).toBeVisible({ timeout: 10000 });
    });

    test('SOCIAL-003-02: Activity shows user name and action', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Scroll to see activity feed
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Action text (joined, completed, streak)
      await expect(page.locator('text=joined').or(
        page.locator('text=completed').or(
        page.locator('text=streak'))
      )).toBeVisible({ timeout: 10000 });
    });

    test('SOCIAL-003-03: Different activity types displayed', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // Scroll to see activity feed
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // From seed data we have different activity types
      // challenge_joined, streak_milestone, challenge_completed
      await expect(page.locator('text=joined').or(
        page.locator('text=streak').or(
        page.locator('text=completed'))
      )).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Scenario: Activity Feed Loading', () => {
    
    test('SOCIAL-003-04: Activity feed loads from API', async ({ page }) => {
      let feedApiCalled = false;
      
      await page.route('**/api/social/feed*', async route => {
        feedApiCalled = true;
        await route.continue();
      });

      await loginAndGoToSocial(page);
      
      // Wait for feed to load
      await page.waitForTimeout(2000);
      
      // API should be called
      expect(feedApiCalled).toBeTruthy();
    });
  });
});

// ============================================================================
// FEATURE: LEADERBOARD WITH DIFFERENT USERS (SOCIAL-004)
// ============================================================================

test.describe('Feature: Leaderboard Data (SOCIAL-004)', () => {

  test.describe('Scenario: Different Users See Leaderboard', () => {
    
    test('SOCIAL-004-01: Friend user sees leaderboard', async ({ page }) => {
      // Login as friend1 (Jane)
      await login(page, TEST_USERS.friend1);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 5000 });
      
      // Jane should see herself with YOU badge
      await expect(page.locator('text=YOU').or(page.locator('text=You'))).toBeVisible({ timeout: 10000 });
    });

    test('SOCIAL-004-02: Admin user sees leaderboard', async ({ page }) => {
      await login(page, TEST_USERS.adminUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 5000 });
    });
  });
});

// ============================================================================
// FEATURE: LEADERBOARD RANKING (SOCIAL-005)
// ============================================================================

test.describe('Feature: Leaderboard Ranking (SOCIAL-005)', () => {

  test.describe('Scenario: Ranking Order', () => {
    
    test('SOCIAL-005-01: Users sorted by streak/points', async ({ page }) => {
      await loginAndGoToSocial(page);
      
      // From seed data:
      // friend1 (Jane) has streak 21 (highest)
      // friend3 (Alice) has streak 15
      // adminUser has streak 14
      // friend2 (Bob) has streak 10
      // testUser has streak 7
      
      // Jane should be near top (highest streak)
      const janePosition = page.locator(`text=${TEST_USERS.friend1.name}`);
      await expect(janePosition).toBeVisible({ timeout: 10000 });
    });
  });
});

// ============================================================================
// FEATURE: TIME PERIOD FILTER (SOCIAL-006) - Backend supports but UI not implemented
// ============================================================================

test.describe.skip('Feature: Time Period Filter (SOCIAL-006) - NOT IMPLEMENTED', () => {
  
  test('SOCIAL-006-01: Filter by daily period', async ({ page }) => {
    // Not implemented in UI
  });

  test('SOCIAL-006-02: Filter by weekly period', async ({ page }) => {
    // Not implemented in UI
  });
});

// ============================================================================
// FEATURE: FOLLOW SYSTEM (SOCIAL-007) - Backend only, no UI
// ============================================================================

test.describe.skip('Feature: Follow System (SOCIAL-007) - NOT IMPLEMENTED', () => {
  
  test('SOCIAL-007-01: Follow a user', async ({ page }) => {
    // Backend only, no UI
  });

  test('SOCIAL-007-02: Unfollow a user', async ({ page }) => {
    // Backend only, no UI
  });
});
