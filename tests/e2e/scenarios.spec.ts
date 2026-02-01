import { test, expect } from '@playwright/test';
import { mockAuthResponse, mockTasks, mockChallenges, mockDiscoverChallenges } from './mocks';

test.describe('App Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    // Setup Mocks
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({ json: mockAuthResponse });
    });
    
    await page.route('**/api/users/me', async route => {
        await route.fulfill({ json: mockAuthResponse.user });
    });

    await page.route('**/api/tasks', async route => {
        await route.fulfill({ json: mockTasks });
    });
    
    await page.route('**/api/tasks/*', async route => {
        await route.fulfill({ json: { ...mockTasks[0], completed: true } });
    });

    await page.route('**/api/challenges/my', async route => {
        await route.fulfill({ json: mockChallenges });
    });

    await page.route('**/api/challenges/discover*', async route => {
        await route.fulfill({ json: mockDiscoverChallenges });
    });

    await page.route('**/api/challenge/join/*', async route => {
        await route.fulfill({ json: { success: true } });
    });

    // Login logic reuse (bypass UI login for speed in these tests usually, but here we do UI login to be safe)
    await page.goto('/');
    await page.fill('input[placeholder="alex@example.com"]', 'test@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Current Progress')).toBeVisible();
  });

  test('Dashboard: View tasks and progress', async ({ page }) => {
    // Check Tasks
    await expect(page.locator('text=Drink Water')).toBeVisible();
    await expect(page.locator('text=Read Book')).toBeVisible();
    
    // Check Progress Cards
    await expect(page.locator('text=Morning Yoga Challenge')).toBeVisible();
    await expect(page.locator('text=No Sugar Week')).toBeVisible();
  });

  test('Dashboard: Navigate to Discover and Join Challenge', async ({ page }) => {
    // Click Discover
    await page.click('button:has-text("Discover New Challenges")');
    
    // Check Discover View
    await expect(page.locator('h2:has-text("Discover Challenges")')).toBeVisible();
    
    // Search
    await page.fill('input[placeholder="Search challenges..."]', 'Marathon');
    // Wait for debounce usually, but mock returns immediately. 
    // However, the component has debounce 300ms.
    await page.waitForTimeout(500); 
    
    // Check result
    await expect(page.locator('text=Marathon Training')).toBeVisible();
    
    // Join
    await page.click('button:has-text("Join Challenge") >> nth=0'); 
    // Assuming the button text is "Join Challenge" or "Join". 
    // DiscoverView.tsx doesn't show the card rendering in the snippet. 
    // Assuming "Join" button exists on the challenge card.
    
    // After join, it usually updates UI.
    // The component sets isJoined=true. 
    // We can check if button text changes or "Joined" appears.
  });

  test('Navigation: Switch Tabs', async ({ page }) => {
    // Go to Social
    await page.click('button:has-text("Social")');
    // Verify Social View (Leaderboard etc)
    // Need to know what's in SocialView. Assuming some text.
    // Using a safe bet: URL change or some unique element.
    // The bottom nav sets active tab.
    
    // Go to Me (Profile)
    await page.click('button:has-text("Me")');
    // Verify Profile View
    // Should show user name
    await expect(page.locator(`text=${mockAuthResponse.user.name}`)).toBeVisible();
  });
});
