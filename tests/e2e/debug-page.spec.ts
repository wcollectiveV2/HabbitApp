
import { test, expect } from '@playwright/test';

test('Debug Page Content', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);
  console.log('Page Title:', await page.title());
  console.log('Body Text:', await page.locator('body').innerText());
  
  // Check for login input explicitely
  const inputCount = await page.locator('input[type="email"]').count();
  console.log('Email Inputs found:', inputCount);
});
