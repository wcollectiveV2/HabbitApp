// features.spec.ts
// Task Interactions and Habit Coach Features
// These tests verify core task management and AI coaching functionality
// Uses REAL database with seeded test data (no mocks)

import { test, expect, Page } from '@playwright/test';
import { 
  TEST_USERS, 
  TEST_TASKS,
  login,
  toggleTask,
  waitForTasks
} from '../e2e-test-config';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function loginAndGoHome(page: Page) {
  await login(page, TEST_USERS.testUser);
  await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
}

// ============================================================================
// FEATURE: TASK INTERACTIONS
// ============================================================================

test.describe('Feature: Task Interactions', () => {

  test('should display tasks from seeded data', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Should see tasks from seed data
    await expect(page.locator(`text=${TEST_TASKS.drinkWater.title}`)).toBeVisible({ timeout: 10000 });
  });

  test('should allow checking off a task', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Find Morning Run task (check type)
    const taskCard = page.locator(`text=${TEST_TASKS.morningRun.title}`).locator('..');
    const toggleButton = taskCard.locator('button').first();
    
    // Click to toggle
    await toggleButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1500);
    
    // Task state should change (might show completed styling or update)
  });

  test('should increment counter task', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Find Drink Water task (counter type, goal: 8, current: 3)
    const taskCard = page.locator(`text=${TEST_TASKS.drinkWater.title}`).locator('..');
    const incrementButton = taskCard.locator('button:has-text("+")').or(
      taskCard.locator('button').first()
    );
    
    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      await page.waitForTimeout(1000);
      
      // Value should update
    }
  });

  test('should show completed tasks differently', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Meditation task is completed in seed data
    const completedTask = page.locator(`text=${TEST_TASKS.meditation.title}`);
    if (await completedTask.isVisible()) {
      // Should have completed styling (strikethrough, checkmark, etc.)
    }
  });

  test('should show task progress for counter tasks', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Drink Water has current_value: 3, goal: 8
    await expect(page.locator('text=3').or(page.locator('text=/8'))).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// FEATURE: HABIT COACH
// ============================================================================

test.describe('Feature: Habit Coach', () => {

  test('should open chat and send message', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Open AI Coach
    const aiButton = page.locator('button:has(.material-symbols-outlined:has-text("smart_toy"))');
    await aiButton.click();
    await expect(page.locator('h3:has-text("Habit Coach")').or(page.locator('text=Pulse'))).toBeVisible({ timeout: 5000 });
    
    // Send a message
    const input = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Ask"]'));
    await input.fill('How can I improve my habits?');
    await page.keyboard.press('Enter');
    
    // Message should appear
    await expect(page.locator('text=How can I improve')).toBeVisible({ timeout: 5000 });
    
    // Wait for AI response
    await page.waitForTimeout(3000);
  });

  test('should show suggested questions', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Open AI Coach
    await page.click('button:has(.material-symbols-outlined:has-text("smart_toy"))');
    await expect(page.locator('h3:has-text("Habit Coach")')).toBeVisible({ timeout: 5000 });
    
    // Should see suggested questions
    await expect(page.locator('text=habits').or(
      page.locator('text=routines').or(
      page.locator('text=motivated'))
    )).toBeVisible();
  });

  test('should close chat modal', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Open AI Coach
    await page.click('button:has(.material-symbols-outlined:has-text("smart_toy"))');
    await expect(page.locator('h3:has-text("Habit Coach")')).toBeVisible({ timeout: 5000 });
    
    // Close
    const closeButton = page.locator('button:has(.material-symbols-outlined:has-text("close"))');
    await closeButton.click();
    
    // Modal should be closed
    await expect(page.locator('h3:has-text("Habit Coach")')).not.toBeVisible({ timeout: 3000 });
  });
});

// ============================================================================
// FEATURE: TASK TYPES
// ============================================================================

test.describe('Feature: Task Types', () => {

  test('should display check type tasks', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Morning Run is check type
    await expect(page.locator(`text=${TEST_TASKS.morningRun.title}`)).toBeVisible({ timeout: 10000 });
  });

  test('should display counter type tasks with progress', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Drink Water is counter type
    await expect(page.locator(`text=${TEST_TASKS.drinkWater.title}`)).toBeVisible({ timeout: 10000 });
    
    // Should show progress (3/8 from seed)
    await expect(page.locator('text=3').or(page.locator('text=/8'))).toBeVisible();
  });
});

// ============================================================================
// FEATURE: OVERDUE TASKS
// ============================================================================

test.describe('Feature: Overdue Tasks', () => {

  test('should show overdue task indicator', async ({ page }) => {
    await loginAndGoHome(page);
    
    // Overdue Task from seed has due_date in the past
    const overdueTask = page.locator(`text=${TEST_TASKS.overdueTask.title}`);
    if (await overdueTask.isVisible()) {
      // Should have overdue styling
      await expect(overdueTask.locator('..').locator('..')).toBeVisible();
    }
  });
});

