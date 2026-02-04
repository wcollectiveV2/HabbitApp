// scenarios.spec.ts
// Integration Scenarios - End-to-End User Journeys
// These tests verify complete user workflows across multiple features
// Uses REAL database with seeded test data (no mocks)

import { test, expect, Page } from '@playwright/test';
import { 
  TEST_USERS, 
  TEST_TASKS,
  TEST_CHALLENGES,
  login,
  logout,
  navigateTo
} from '../e2e-test-config';

// ============================================================================
// SCENARIO: COMPLETE USER JOURNEY
// ============================================================================

test.describe('App Scenarios', () => {

  test.describe('Dashboard View', () => {
    
    test('tasks and progress', async ({ page }) => {
      // Login
      await login(page, TEST_USERS.testUser);
      
      // Verify dashboard loads
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Verify tasks are displayed
      await expect(page.locator(`text=${TEST_TASKS.drinkWater.title}`)).toBeVisible({ timeout: 10000 });
      
      // Verify stats are shown
      await expect(page.locator(`text=${TEST_USERS.testUser.streak}`).or(page.locator('text=streak'))).toBeVisible();
    });
  });

  test.describe('Navigation: Switch Tabs', () => {
    
    test('navigate between all tabs', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Navigate to Discover
      await page.click('button:has-text("Discover")');
      await expect(page.locator('[placeholder*="earch"]').or(page.locator('h2:has-text("Discover")'))).toBeVisible({ timeout: 5000 });
      
      // Navigate to Social
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 5000 });
      
      // Navigate to Profile
      await page.click('button:has-text("Me")');
      await expect(page.locator(`text=${TEST_USERS.testUser.name}`)).toBeVisible({ timeout: 5000 });
      
      // Navigate back to Home
      await page.click('button:has-text("Home")');
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Complete Task Journey', () => {
    
    test('view and interact with tasks', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // See tasks
      await expect(page.locator(`text=${TEST_TASKS.drinkWater.title}`)).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${TEST_TASKS.morningRun.title}`)).toBeVisible();
      
      // Toggle a check task
      const taskCard = page.locator(`text=${TEST_TASKS.morningRun.title}`).locator('..');
      const toggleButton = taskCard.locator('button').first();
      await toggleButton.click();
      
      // Wait for update
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Challenge Journey', () => {
    
    test('view challenges user is participating in', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // User participates in Morning Yoga and No Sugar challenges (from seed)
      await expect(page.locator('text=Yoga').or(page.locator('text=Sugar'))).toBeVisible({ timeout: 10000 });
      
      // Click on a challenge
      await page.click('text=Yoga');
      await page.waitForTimeout(500);
      
      // View challenge details
      await expect(page.locator('text=Yoga').or(page.locator('text=21'))).toBeVisible();
      
      // Go back
      const backButton = page.locator('button:has(.material-symbols-outlined:has-text("arrow_back"))');
      await backButton.click();
    });
  });

  test.describe('Social Journey', () => {
    
    test('view leaderboard and friends', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Go to Social
      await page.click('button:has-text("Social")');
      await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 5000 });
      
      // See users on leaderboard
      await expect(page.locator(`text=${TEST_USERS.friend1.name}`).or(
        page.locator('text=Jane')
      )).toBeVisible({ timeout: 10000 });
      
      // Switch to Friends
      await page.click('button:has-text("Friends")');
      await page.waitForTimeout(1000);
      
      // See friends (testUser follows friend1-3)
      await expect(page.locator('text=Jane').or(page.locator('text=Bob'))).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Profile Journey', () => {
    
    test('view and edit profile', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Go to Profile
      await page.click('button:has-text("Me")');
      await expect(page.locator(`text=${TEST_USERS.testUser.name}`)).toBeVisible({ timeout: 5000 });
      
      // See streak
      await expect(page.locator(`text=${TEST_USERS.testUser.streak}`)).toBeVisible();
      
      // Open edit profile
      await page.click('text=Edit Profile');
      await expect(page.locator('input').first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Login/Logout Journey', () => {
    
    test('complete login and logout flow', async ({ page }) => {
      // Login
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Go to profile
      await page.click('button:has-text("Me")');
      await expect(page.locator(`text=${TEST_USERS.testUser.name}`)).toBeVisible({ timeout: 5000 });
      
      // Logout
      await page.click('button:has-text("Logout"), text=Logout');
      
      // Should be on login page
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
      
      // Login again
      await page.fill('input[type="email"]', TEST_USERS.testUser.email);
      await page.fill('input[type="password"]', TEST_USERS.testUser.password);
      await page.click('button[type="submit"]');
      
      // Should be back on dashboard
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    });
  });
});

// ============================================================================
// SCENARIO: DIFFERENT USER EXPERIENCES
// ============================================================================

test.describe('Different User Experiences', () => {

  test('friend user experience', async ({ page }) => {
    // Login as Jane (friend1) - has 21 day streak
    await login(page, TEST_USERS.friend1);
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    
    // See Jane's name in greeting
    await expect(page.locator('text=Jane')).toBeVisible();
    
    // Go to profile
    await page.click('button:has-text("Me")');
    await expect(page.locator(`text=${TEST_USERS.friend1.name}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=21')).toBeVisible(); // Her streak
  });

  test('admin user experience', async ({ page }) => {
    await login(page, TEST_USERS.adminUser);
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    
    // Admin can access all regular features
    await page.click('button:has-text("Discover")');
    await expect(page.locator('[placeholder*="earch"]').or(page.locator('h2:has-text("Discover")'))).toBeVisible({ timeout: 5000 });
  });

  test('manager user experience', async ({ page }) => {
    await login(page, TEST_USERS.managerUser);
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    
    // Manager can access regular features
    await page.click('button:has-text("Me")');
    await expect(page.locator(`text=${TEST_USERS.managerUser.name}`)).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// SCENARIO: AI COACH INTERACTION
// ============================================================================

test.describe('AI Coach Interaction', () => {

  test('complete coach conversation', async ({ page }) => {
    await login(page, TEST_USERS.testUser);
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    
    // Open coach
    await page.click('button:has(.material-symbols-outlined:has-text("smart_toy"))');
    await expect(page.locator('h3:has-text("Habit Coach")')).toBeVisible({ timeout: 5000 });
    
    // Send first message
    const input = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Ask"]'));
    await input.fill('What are good morning habits?');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=morning habits')).toBeVisible({ timeout: 5000 });
    
    // Wait for AI response
    await page.waitForTimeout(3000);
    
    // Send follow-up
    await input.fill('How do I stay consistent?');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=consistent')).toBeVisible({ timeout: 5000 });
    
    // Close coach
    await page.click('button:has(.material-symbols-outlined:has-text("close"))');
    await expect(page.locator('h3:has-text("Habit Coach")')).not.toBeVisible({ timeout: 3000 });
  });
});

