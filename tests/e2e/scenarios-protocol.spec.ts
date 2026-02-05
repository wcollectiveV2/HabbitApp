// scenarios-protocol.spec.ts
// A-PROT: Protocol Execution Scenarios

import { test, expect } from '@playwright/test';
import { TEST_USERS, TEST_TASKS, login } from './e2e-test-config';

test.describe('A-PROT-01: Action Completion', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Tasks API
        await page.route('**/api/tasks/today', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    date: new Date().toISOString(),
                    completedCount: 0,
                    totalCount: 2,
                    streakDay: 1,
                    tasks: [
                        {
                            id: 'task-morning-run',
                            title: 'Morning Run',
                            type: 'check',
                            status: 'pending',
                            currentValue: 0
                        },
                        {
                            id: 'task-drink-water',
                            title: 'Drink Water',
                            type: 'counter',
                            goal: 8,
                            unit: 'Cup',
                            status: 'pending',
                            currentValue: 0
                        }
                    ]
                })
            });
        });

        // Mock Task Update API
        await page.route('**/api/tasks/*', async route => {
             if (route.request().method() === 'PATCH') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' })
                });
             } else {
                 await route.continue();
             }
        });

        await login(page, TEST_USERS.testUser);
        await expect(page.locator('text=Good').or(page.locator('text=Hello'))).toBeVisible({ timeout: 15000 });
    });

    test('Complete boolean task (Done/Not Done)', async ({ page }) => {
        // Find a boolean task (e.g., "Morning Run")
        const taskTitle = TEST_TASKS.morningRun.title;
        const taskRow = page.locator(`text=${taskTitle}`).first().locator('..');
        
        // Ensure it's not completed
        if (await taskRow.locator('.material-symbols-outlined:has-text("check_circle")').count() > 0) {
            // It's completed, toggle off first? Or assume seed state.
            // For now, toggle it.
            await taskRow.click();
            await page.waitForTimeout(500); 
        }

        // Toggle to Complete (Clicking the task assumes it toggles)
        await taskRow.click();
        
        // Verify completed state (Visual check or text decoration)
        // Adjust selector based on actual UI implementation
        await expect(taskRow).toHaveClass(/completed|opacity-50/); // Example class check
    });

    test('Complete numeric range task (e.g., 1–8)', async ({ page }) => {
        // Find a numeric task (e.g., "Drink Water")
        const taskTitle = TEST_TASKS.drinkWater.title;
        // This task usually has +/- buttons
        const taskRow = page.locator(`text=${taskTitle}`).first().locator('..');
        
        // Find + button
        const plusBtn = taskRow.locator('button:has-text("+")').or(taskRow.locator('button .material-symbols-outlined:has-text("add")'));
        
        // Check initial value (e.g. 0/8 or 3/8 from seed)
        const progressText = await taskRow.locator('text=/').textContent();
        expect(progressText).toBeTruthy();
        
        const [initial] = progressText!.split('/').map(s => parseFloat(s));
        
        // Increment
        await plusBtn.click();
        
        // Verify value increased
        await expect(taskRow.locator('text=/')).toContainText(`${initial + 1}`);
    });

    test('Submit numeric + unit value (e.g., 0.5 L)', async ({ page }) => {
       // This requires an input field rather than simple +/-, or clicking the task to open detail view
       // Assuming clicking the task title opens detail view for input
       const taskTitle = TEST_TASKS.drinkWater.title;
       await page.click(`text=${taskTitle}`);
       
       // Modal or detail view should open
       const input = page.locator('input[type="number"]');
       if (await input.isVisible()) {
           await input.fill('0.5'); // Mock inputting 0.5
           // If there is a unit selector, we might test that too
           // Submit
           await page.click('button:has-text("Save")');
           
           // Verify update on dashboard
           await expect(page.locator(`text=${taskTitle}`).locator('..')).toContainText('0.5'); // Or updated total
       } else {
           // If UI is strictly +/- buttons, this test is skipped or adapted
           test.skip('No direct numeric input UI found for this task type');
       }
    });
});

test.describe('A-PROT-02: Validation', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, TEST_USERS.testUser);
    });

    test('Reject out‑of‑range values (UI validation)', async ({ page }) => {
        // Access numeric task detail
        const taskTitle = TEST_TASKS.drinkWater.title;
        const taskRow = page.locator(`text=${taskTitle}`).first().locator('..');
        
        // If we can input value:
        await page.click(`text=${taskTitle}`);
        const input = page.locator('input[type="number"]');
        
        if (await input.isVisible()) {
            await input.fill('100'); // Assuming 100 is out of range (goal is 8)
            // Or typically range is 1-10 scale.
            
            // Check provided max attribute
            const max = await input.getAttribute('max');
            if (max) {
                 await input.fill(String(parseInt(max) + 1));
                 await page.click('button:has-text("Save")');
                 // Expect validation error
                 await expect(page.locator('text=Value too high').or(input)).toHaveClass(/invalid|error/);
            }
        }
    });
});

test.describe('A-PROT-03: Offline Mode', () => {
    test.beforeEach(async ({ page }) => {        // Mock Tasks API
        await page.route('**/api/tasks/today', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    date: new Date().toISOString(),
                    completedCount: 0,
                    totalCount: 2,
                    streakDay: 1,
                    tasks: [
                        {
                            id: 'task-morning-run',
                            title: 'Morning Run',
                            type: 'check',
                            status: 'pending',
                            currentValue: 0,
                            icon: 'directions_run'
                        },
                        {
                            id: 'task-drink-water',
                            title: 'Drink Water',
                            type: 'counter',
                            goal: 8,
                            unit: 'Cup',
                            status: 'pending',
                            currentValue: 0,
                            secondaryValueString: '0/8',
                            icon: 'water_drop'
                        }
                    ]
                })
            });
        });

        // Mock Habits API (in case Home uses this)
        await page.route('**/api/habits', async route => {
             await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'habit-1',
                        name: 'Morning Run',
                        category: 'fitness', 
                        frequency: 'daily',
                        targetCount: 1,
                        completionsToday: 0,
                        completedToday: false
                    }
                ])
             });
        });

        // Mock Task Update API
        await page.route('**/api/tasks/*', async route => {
             if (route.request().method() === 'PATCH') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' })
                });
             } else {
                 await route.continue();
             }
        });
         await login(page, TEST_USERS.testUser);
         await expect(page.locator('text=Good').or(page.locator('text=Hello'))).toBeVisible();
    });

    test('Complete actions offline and sync when online', async ({ page }) => {
        // Go offline
        await page.context().setOffline(true);
        
        // Perform action (e.g. check "Morning Run")
        const taskTitle = TEST_TASKS.morningRun.title;
        const taskRow = page.locator(`text=${taskTitle}`).first().locator('..');
        await taskRow.click();
        
        // Verify optimistic update
        await expect(taskRow).toHaveCSS('text-decoration-line', 'line-through'); // or checking status
        
        // Go online
        await page.context().setOffline(false);
        
        // Wait for sync (maybe check network request or reload page to see if persisted)
        // With real backend, reload page
        await page.reload();
        await expect(page.locator(`text=${taskTitle}`).first().locator('..')).toHaveCSS('text-decoration-line', 'line-through');
    });
});
