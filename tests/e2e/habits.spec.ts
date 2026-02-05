// habits.spec.ts
// Comprehensive E2E tests for Habit Management
// Feature: Habit Creation, Completion (Simple & Counter), Deletion
// Uses REAL database with seeded test data where possible, but creates new habits for isolation

import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './e2e-test-config';

// Unique suffix for this test run to avoid collisions
const TEST_ID = Date.now();

test.describe('Feature: Habit Management (HABIT-001)', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.testUser);
    await page.click('text=Habits'); 
    await expect(page.locator('h1, h2, button').filter({ hasText: /Habit|Create/ })).toBeVisible({ timeout: 10000 });
  });

  test('HABIT-001-01: Create a simple daily habit', async ({ page }) => {
    const habitName = `Test Habit ${TEST_ID}`;
    
    // Open modal
    await page.getByLabel('Add new habit').click();
    await expect(page.locator('text=New Habit')).toBeVisible(); 
    
    // Fill form
    await page.fill('input[placeholder*="e.g."]', habitName);
    
    // Select category - force click if needed, but try normal first
    await page.locator('button:has-text("Health")').click();
    
    // Save
    await page.locator('button:has-text("Save")').click();
    
    // Verify modal closes
    await expect(page.locator('text=New Habit')).not.toBeVisible();
    
    // Verify it appears in list
    const card = page.locator('div')
      .filter({ has: page.locator('h3', { hasText: habitName }) })
      .filter({ has: page.locator('button') })
      .last();
    await expect(card).toBeVisible();
  });

  test('HABIT-001-02: Create a counter habit (Drink Water 3x)', async ({ page }) => {
    const habitName = `Water ${TEST_ID}`;
    
    await page.getByLabel('Add new habit').click();
    await expect(page.locator('text=New Habit')).toBeVisible();

    await page.fill('input[placeholder*="e.g."]', habitName);
    
    // Target count
    const targetContainer = page.locator('div')
        .filter({ has: page.locator('label', { hasText: /^Target per/ }) })
        .last();
        
    const plusBtn = targetContainer.locator('button').filter({ hasText: 'add' });
    
    await expect(plusBtn).toBeVisible();
    await plusBtn.click();
    await plusBtn.click();
    
    await expect(targetContainer.locator('span.text-3xl')).toHaveText('3');
    
    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=New Habit')).not.toBeVisible();
    
    const card = page.locator('div')
      .filter({ has: page.locator('h3', { hasText: habitName }) })
      .filter({ has: page.locator('button') })
      .last();
      
    await expect(card).toBeVisible();
    await expect(card).toContainText('0/3'); 
  });
});

test.describe('Feature: Habit Completion (HABIT-002)', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.testUser);
    await page.click('text=Habits');
  });

  test('HABIT-002-01: Complete simple habit', async ({ page }) => {
    const habitName = `Checkoff ${TEST_ID}`;
    await page.getByLabel('Add new habit').click();
    await page.fill('input[placeholder*="e.g."]', habitName);
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=New Habit')).not.toBeVisible();
    
    const card = page.locator('div')
      .filter({ has: page.locator('h3', { hasText: habitName }) })
      .filter({ has: page.locator('button') })
      .last();
      
    await expect(card).toBeVisible();

    // Click checkmark button
    // Locate the first button in the card container
    const toggleBtn = card.locator('button').first();
    await expect(toggleBtn).toBeEnabled();
    
    // Ensure we are clicking cleanly
    await toggleBtn.scrollIntoViewIfNeeded();
    await toggleBtn.click();
    
    // Verify check_circle appears (filled)
    await expect(card.locator('.material-symbols-outlined').first()).toHaveText('check_circle', { timeout: 10000 });
  });

  test('HABIT-002-02: Increment counter habit', async ({ page }) => {
    const habitName = `Counter ${TEST_ID}`;
    await page.getByLabel('Add new habit').click();
    await page.fill('input[placeholder*="e.g."]', habitName);
    
    // Set target to 2
    const targetContainer = page.locator('div')
        .filter({ has: page.locator('label', { hasText: /^Target per/ }) })
        .last();
    const plusBtn = targetContainer.locator('button').filter({ hasText: 'add' });
    await plusBtn.click();
    
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=New Habit')).not.toBeVisible();
    
    const card = page.locator('div')
      .filter({ has: page.locator('h3', { hasText: habitName }) })
      .filter({ has: page.locator('button') })
      .last();
    await expect(card).toBeVisible();
    
    await expect(card).toContainText('0/2');
    
    // Click 1
    const toggleBtn = card.locator('button').first();
    await expect(toggleBtn).toBeEnabled();
    await toggleBtn.click();
    
    // Wait for text to update
    await expect(card).toContainText('1/2', { timeout: 10000 });
    
    // Click 2 (Complete)
    await expect(toggleBtn).toBeEnabled();
    await toggleBtn.click();
    await expect(card.locator('.material-symbols-outlined').first()).toHaveText('check_circle', { timeout: 10000 });
  });
});
