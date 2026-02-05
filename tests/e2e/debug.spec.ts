
import { test, expect } from '@playwright/test';
import { TEST_USERS } from './e2e-test-config';

test('debug home page content', async ({ page }) => {
  // Manual login to avoid helper assertions
  await page.goto('/');
  await page.fill('input[type="email"]', TEST_USERS.testUser.email);
  await page.fill('input[type="password"]', TEST_USERS.testUser.password);
  await page.click('button[type="submit"]');

  await page.waitForTimeout(5000); // Wait for redirect and render
  
  const content = await page.content();
  console.log('--- PAGE CONTENT START ---');
  console.log(content);
  console.log('--- PAGE CONTENT END ---');
  
  const currentProgress = await page.locator('text=Current Progress').count();
  console.log('Current Progress count:', currentProgress);
  
  const discover = await page.locator('text=Discover New Challenges').count();
  console.log('Discover count:', discover);
});
