// habits.spec.ts
// Comprehensive E2E tests for Habit Management
// Feature: Habit Creation, Completion (Simple & Counter), Deletion
// Uses REAL database with seeded test data where possible, but creates new habits for isolation

import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './e2e-test-config';

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
    
    // Select category 
    await page.locator('button:has-text("Health")').click();
    
    // Save
    await page.locator('button:has-text("Save")').click();
    
    // Verify modal closes
    await expect(page.locator('text=New Habit')).not.toBeVisible();
    
    // Verify it appears in list using data-testid if available, or robust text matching
    // We look for h3 with exact text
    const title = page.locator('h3', { hasText: habitName });
    await expect(title).toBeVisible();
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
    
    const countSpan = targetContainer.locator('span').filter({ hasText: /^\d+$/ });
    await expect(countSpan).toHaveText('3');
    
    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=New Habit')).not.toBeVisible();
    
    const title = page.locator('h3', { hasText: habitName });
    await expect(title).toBeVisible();
    
    // Find parent card to check text
    // We can use the title locator to find the closest card container if needed, 
    // but verifying title visibility is enough for creation generally if checking text elsewhere.
    await expect(page.locator(`text=${habitName}`)).toBeVisible();
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
    
    // Use the robust locator strategy: Find the card by the unique habit name
    // We added data-testid but we don't know the ID here easily without intercepting creation.
    // So we use strict filtering.
    // We select the specific card that contains the h3 with exact text.
    // .locator('div') is too broad, so we use a more specific selector strategy or wait for unique content.
    // The HabitCard has a button and an h3.
    
    // Strategy: Find the h3, then go up to the card container.
    // But Playwright's filter is better.
    // We exclude 'root' or 'layout' divs by ensuring it has the specific toggle button structure if possible.
    // Or just rely on the fact that the card is the immediate container of the h3's parent row.
    
    // Best way: Locate the H3, then find the toggle button next to it (in the DOM structure).
    // Structure: Button | Div(H3...)
    const habitTitle = page.locator('h3', { hasText: habitName });
    const cardContent = habitTitle.locator('..').locator('..'); // Up to text container, Up to flex row
    const card = cardContent.locator('xpath=..'); // Up to card wrapper

    await expect(card).toBeVisible();

    const toggleBtn = card.locator('button').first();
    await expect(toggleBtn).toBeEnabled();
    
    // Expect unchecked state initially
    await expect(toggleBtn).toContainText('radio_button_unchecked');

    // Click
    const completionResponsePromise = page.waitForResponse(response => 
      response.url().includes('/complete') && response.request().method() === 'POST'
    );
    
    await toggleBtn.click({ force: true });
    
    // Verify API success
    const response = await completionResponsePromise;
    if (response.status() >= 300) {
        console.log(`[API ERROR] Status: ${response.status()}`);
        console.log(`[API ERROR] Body: ${await response.text()}`);
    }
    expect(response.status()).toBeLessThan(300);

    // Verify UI update
    await expect(toggleBtn.locator('.material-symbols-outlined')).toHaveText('check_circle', { timeout: 10000 });
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
    
    // Locate card
    const habitTitle = page.locator('h3', { hasText: habitName });
    const cardContent = habitTitle.locator('..').locator('..');
    const card = cardContent.locator('xpath=..');
    
    await expect(card).toBeVisible();
    await expect(card).toContainText('0/2');
    
    const toggleBtn = card.locator('button').first();
    
    // Increment 1
    const incResponse = page.waitForResponse(r => r.url().includes('/complete') && r.request().method() === 'POST');
    await toggleBtn.click({ force: true });
    
    // Add logging
    const response = await incResponse;
    if (response.status() >= 300) {
        console.log(`[API ERROR 002-02] Status: ${response.status()}`);
        console.log(`[API ERROR 002-02] Body: ${await response.text()}`);
    }

    await expect(response.status()).toBeLessThan(300);
    
    await expect(card).toContainText('1/2');
    
    // Complete
    const compResponse = page.waitForResponse(r => r.url().includes('/complete') && r.request().method() === 'POST');
    await toggleBtn.click({ force: true });
    await expect((await compResponse).status()).toBeLessThan(300);
    
    await expect(toggleBtn.locator('.material-symbols-outlined')).toHaveText('check_circle');
  });
});
