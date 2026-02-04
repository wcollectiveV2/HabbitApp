// auth.spec.ts
// Comprehensive E2E tests for Authentication & User Management
// Feature: Login, Registration, Token Management, Logout
// Uses REAL database with seeded test data (no mocks)

import { test, expect, Page } from '@playwright/test';
import { TEST_USERS, login, logout, assertOnLoginPage, assertOnDashboard } from './e2e-test-config';

// ============================================================================
// FEATURE: LOGIN SYSTEM (AUTH-001)
// ============================================================================

test.describe('Feature: Login System (AUTH-001)', () => {

  test.describe('Scenario: Successful Login', () => {
    
    test('AUTH-001-01: User can log in with valid email and password', async ({ page }) => {
      await page.goto('/');
      
      // Verify login form is visible
      await expect(page.locator('h1')).toContainText(/Sign In|Welcome/i);
      
      // Fill in credentials with seeded test user
      await page.fill('input[type="email"]', TEST_USERS.testUser.email);
      await page.fill('input[type="password"]', TEST_USERS.testUser.password);
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Verify successful redirect to home (real API response)
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    });

    test('AUTH-001-02: Login button shows loading spinner during API call', async ({ page }) => {
      // Intercept login request to ensure we can catch the loading state
      await page.route('**/api/auth/login', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/');
      await page.fill('input[type="email"]', TEST_USERS.testUser.email);
      await page.fill('input[type="password"]', TEST_USERS.testUser.password);
      
      // Click and immediately check for loading state
      await page.click('button[type="submit"]');
      
      // Button should show loading state (spinner or disabled)
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test('AUTH-001-04: User is redirected to Home after successful login', async ({ page }) => {
      // Use the login helper from e2e-test-config
      await login(page, TEST_USERS.testUser);
      
      // Verify home view elements
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      // Verify bottom navigation is visible
      await expect(page.locator('button:has-text("Home"), nav')).toBeVisible();
    });

    test('AUTH-001-05: Access token is stored in localStorage after login', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      
      // Wait for dashboard to ensure login completed
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Check localStorage - real JWT token should be stored
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
      // Verify it looks like a JWT (3 parts separated by dots)
      expect(token!.split('.').length).toBe(3);
    });

    test('AUTH-001-06: Refresh token is stored in localStorage after login', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Check localStorage for refresh token
      const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      expect(refreshToken).toBeTruthy();
    });
  });

  test.describe('Scenario: Failed Login', () => {
    
    test('AUTH-001-03: Login displays error message for invalid credentials', async ({ page }) => {
      await page.goto('/');
      
      // Use wrong credentials (not in seed data)
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Verify error message is displayed (real API returns 401)
      await expect(page.locator('text=Invalid').or(page.locator('text=error').or(page.locator('[role="alert"]')))).toBeVisible({ timeout: 5000 });
    });

    test('AUTH-001-07: User remains on login page after failed login', async ({ page }) => {
      await page.goto('/');
      
      // Use wrong credentials
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error to appear
      await page.waitForTimeout(1000);
      
      // Should still see login form
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });

  test.describe('Scenario: Form Validation', () => {
    
    test('AUTH-001-08: Login button is disabled when email is empty', async ({ page }) => {
      await page.goto('/');
      
      // Only fill password
      await page.fill('input[type="password"]', 'password123');
      
      // Submit button should be disabled or form should not submit
      const submitButton = page.locator('button[type="submit"]');
      // Either disabled or clicking does nothing
      const isDisabled = await submitButton.isDisabled();
      if (!isDisabled) {
        await submitButton.click();
        // Should still be on login page
        await expect(page.locator('input[type="email"]')).toBeVisible();
      }
    });

    test('AUTH-001-09: Login button is disabled when password is empty', async ({ page }) => {
      await page.goto('/');
      
      // Only fill email
      await page.fill('input[type="email"]', TEST_USERS.testUser.email);
      
      const submitButton = page.locator('button[type="submit"]');
      const isDisabled = await submitButton.isDisabled();
      if (!isDisabled) {
        await submitButton.click();
        await expect(page.locator('input[type="password"]')).toBeVisible();
      }
    });

    test('AUTH-001-10: Email field validates email format', async ({ page }) => {
      await page.goto('/');
      
      // Enter invalid email
      await page.fill('input[type="email"]', 'notanemail');
      await page.fill('input[type="password"]', 'password123');
      
      // Try to submit
      await page.click('button[type="submit"]');
      
      // HTML5 validation should prevent submission or show error
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });
  });
});

// ============================================================================
// FEATURE: REGISTRATION SYSTEM (AUTH-002)
// ============================================================================

test.describe('Feature: Registration System (AUTH-002)', () => {

  test.describe('Scenario: Navigate to Registration', () => {
    
    test('AUTH-002-01: User can navigate from login to signup', async ({ page }) => {
      await page.goto('/');
      
      // Click Sign Up link/button
      await page.click('button:has-text("Sign Up"), a:has-text("Sign Up")');
      
      // Verify registration form is visible
      await expect(page.locator('h1')).toContainText(/Create Account|Sign Up|Register/i);
    });
  });

  test.describe('Scenario: Successful Registration', () => {
    
    test('AUTH-002-02: User can register with valid name, email, password', async ({ page }) => {
      await page.goto('/');
      
      // Navigate to signup
      await page.click('button:has-text("Sign Up"), a:has-text("Sign Up")');
      
      // Generate unique email for this test run to avoid conflicts
      const uniqueEmail = `newuser_${Date.now()}@e2etest.com`;
      
      // Fill registration form
      await page.fill('input[placeholder*="Alex"], input[placeholder*="name"], input[name="name"]', 'Test Registration User');
      await page.fill('input[type="email"], input[placeholder*="email"]', uniqueEmail);
      await page.fill('input[type="password"]', 'TestPass123!');
      
      // Accept terms if checkbox exists
      const termsCheckbox = page.locator('input[type="checkbox"]');
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Verify redirect to home (auto-login) - real API creates user
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    });

    test('AUTH-002-03: User is auto-logged in after successful registration', async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Sign Up")');
      
      // Generate unique email
      const uniqueEmail = `autologin_${Date.now()}@e2etest.com`;
      
      await page.fill('input[placeholder*="Alex"], input[placeholder*="name"], input[name="name"]', 'Auto Login Test');
      await page.fill('input[type="email"]', uniqueEmail);
      await page.fill('input[type="password"]', 'TestPass123!');
      
      const termsCheckbox = page.locator('input[type="checkbox"]');
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
      
      await page.click('button[type="submit"]');
      
      // Should be on home view
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Should have token stored (real JWT from API)
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
    });
  });

  test.describe('Scenario: Failed Registration', () => {
    
    test('AUTH-002-04: Registration shows validation for required fields', async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Sign Up")');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Should show validation errors or stay on registration
      await expect(page.locator('h1')).toContainText(/Create Account|Sign Up|Register/i);
    });

    test('AUTH-002-05: Registration shows error for duplicate email', async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Sign Up")');
      
      // Use email that already exists in seed data
      await page.fill('input[placeholder*="Alex"], input[placeholder*="name"], input[name="name"]', 'Duplicate User');
      await page.fill('input[type="email"]', TEST_USERS.testUser.email); // Already exists
      await page.fill('input[type="password"]', 'TestPass123!');
      
      const termsCheckbox = page.locator('input[type="checkbox"]');
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
      
      await page.click('button[type="submit"]');
      
      // Should show error (real API returns error for duplicate)
      await expect(page.locator('text=already').or(page.locator('text=exists').or(page.locator('text=error').or(page.locator('[role="alert"]'))))).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Scenario: Navigate back to Login', () => {
    
    test('AUTH-002-06: User can navigate back from signup to login', async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Sign Up")');
      
      // Should see registration form
      await expect(page.locator('h1')).toContainText(/Create Account|Sign Up|Register/i);
      
      // Click Sign In link to go back
      await page.click('button:has-text("Sign In"), a:has-text("Sign In"), text=Sign In');
      
      // Should be back on login
      await expect(page.locator('h1')).toContainText(/Sign In|Welcome|Login/i);
    });
  });
});

// ============================================================================
// FEATURE: TOKEN MANAGEMENT (AUTH-003)
// ============================================================================

test.describe('Feature: Token Management (AUTH-003)', () => {

  test.describe('Scenario: Token in API Headers', () => {
    
    test('AUTH-003-01: Auth token is sent with all API requests', async ({ page }) => {
      let capturedAuthHeader: string | null = null;

      // Intercept API calls to capture the auth header (but don't mock the response)
      await page.route('**/api/tasks', async route => {
        capturedAuthHeader = route.request().headers()['authorization'] || null;
        await route.continue();
      });

      // Login with real credentials
      await login(page, TEST_USERS.testUser);
      
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Verify auth header was present
      expect(capturedAuthHeader).toContain('Bearer');
    });
  });

  test.describe('Scenario: Token Expiry', () => {
    
    test('AUTH-003-02: User is redirected to login when token expires', async ({ page }) => {
      // First, login successfully with real credentials
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Clear the token to simulate expiry
      await page.evaluate(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      });
      
      // Trigger a refresh
      await page.reload();
      
      // Should redirect to login
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    });

    test('AUTH-003-03: Refresh token renews access token', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      
      // Get initial tokens
      const initialToken = await page.evaluate(() => localStorage.getItem('token'));
      const initialRefreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      expect(initialToken).toBeTruthy();
      expect(initialRefreshToken).toBeTruthy();
      
      // Simulate token expiration by removing access token but keeping refresh token
      await page.evaluate(() => localStorage.removeItem('token'));
      
      // Reload page which should trigger token refresh logic if implemented
      // or subsequent API call should trigger refresh
      await page.reload();
      
      // Should NOT be redirected to login if refresh works
      await expect(page.locator('input[type="email"]')).not.toBeVisible();
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Check if new access token is present
      const newToken = await page.evaluate(() => localStorage.getItem('token'));
      expect(newToken).toBeTruthy();
      
      // Note: Ideally newToken should be different from initialToken, but depends on backend implementation
    });
  });
});

// ============================================================================
// FEATURE: LOGOUT (AUTH-004)
// ============================================================================

test.describe('Feature: Logout (AUTH-004)', () => {

  test.describe('Scenario: Successful Logout', () => {
    
    test('AUTH-004-01: User can log out from profile page', async ({ page }) => {
      // Login with real credentials
      await login(page, TEST_USERS.testUser);
      
      // Navigate to profile
      await page.click('button:has-text("Me"), button:has-text("Profile")');
      await expect(page.locator(`text=${TEST_USERS.testUser.name}`)).toBeVisible({ timeout: 5000 });
      
      // Find and click logout
      await page.click('button:has-text("Logout"), button:has-text("Sign Out"), text=Logout');
      
      // Should be on login page
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    });

    test('AUTH-004-02: Logout clears tokens from localStorage', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      
      // Verify token exists
      let token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
      
      // Navigate to profile and logout
      await page.click('button:has-text("Me")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Logout"), text=Logout');
      
      // Verify tokens are cleared
      token = await page.evaluate(() => localStorage.getItem('token'));
      const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      expect(token).toBeFalsy();
      expect(refreshToken).toBeFalsy();
    });

    test('AUTH-004-03: User is redirected to login after logout', async ({ page }) => {
      await login(page, TEST_USERS.testUser);
      
      await page.click('button:has-text("Me")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Logout"), text=Logout');
      
      // Should be on login page
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('h1')).toContainText(/Sign In|Welcome|Login/i);
    });
  });
});

// ============================================================================
// FEATURE: SESSION PERSISTENCE (AUTH-005)
// ============================================================================

test.describe('Feature: Session Persistence (AUTH-005)', () => {

  test.describe('Scenario: Remember Session', () => {
    
    test('AUTH-005-01: User stays logged in after page refresh', async ({ page }) => {
      // Login with real credentials
      await login(page, TEST_USERS.testUser);
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
      
      // Refresh page
      await page.reload();
      
      // Should still be logged in (see home view, not login)
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    });

    test('AUTH-005-02: User with valid token skips login page', async ({ page }) => {
      // First login to get a real token
      await login(page, TEST_USERS.testUser);
      
      // Get the real token
      const token = await page.evaluate(() => localStorage.getItem('token'));
      const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      
      // Clear and start fresh
      await page.evaluate(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      });
      await page.goto('/');
      
      // Set the real token before app loads
      await page.evaluate(([t, rt]) => {
        localStorage.setItem('token', t!);
        localStorage.setItem('refreshToken', rt!);
      }, [token, refreshToken]);
      
      // Reload
      await page.reload();
      
      // Should be on home, not login
      await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    });
  });
});

// ============================================================================
// FEATURE: DIFFERENT USER ROLES (AUTH-006)
// ============================================================================

test.describe('Feature: Different User Roles (AUTH-006)', () => {

  test('AUTH-006-01: Admin user can log in successfully', async ({ page }) => {
    await login(page, TEST_USERS.adminUser);
    
    // Verify dashboard loads
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
  });

  test('AUTH-006-02: Manager user can log in successfully', async ({ page }) => {
    await login(page, TEST_USERS.managerUser);
    
    // Verify dashboard loads
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
  });

  test('AUTH-006-03: Friend users can log in for social tests', async ({ page }) => {
    await login(page, TEST_USERS.friend1);
    
    // Verify dashboard loads
    await expect(page.locator('text=Current Progress').or(page.locator('text=Good'))).toBeVisible({ timeout: 15000 });
    
    // Verify user name
    await page.click('button:has-text("Me")');
    await expect(page.locator(`text=${TEST_USERS.friend1.name}`)).toBeVisible({ timeout: 5000 });
  });
});
