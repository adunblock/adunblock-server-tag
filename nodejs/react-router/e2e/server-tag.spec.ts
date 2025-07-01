import { test, expect } from '@playwright/test';

test.describe('React Router ServerTag', () => {
  test.beforeEach(async () => {
    // Ensure mock server is running before tests
    // In a real setup, you'd start the server programmatically
  });

  test('should load and render script tags from remote URL', async ({ page }) => {
    // Navigate to the test app
    await page.goto('http://localhost:5173/');

    // Wait for the page to load
    await page.waitForSelector('h1');

    // Check that the page title is correct
    await expect(page.locator('h1')).toContainText('React Router Framework Mode Test');

    // Check that script tags are rendered in the DOM
    const scriptTags = page.locator('script[src]');
    
    // Should have at least the scripts from our mock API
    const scriptCount = await scriptTags.count();
    expect(scriptCount).toBeGreaterThan(0);

    // Check for specific scripts from our mock API
    const lodashScript = page.locator('script[src*="lodash"]');
    const momentScript = page.locator('script[src*="moment"]');
    
    await expect(lodashScript).toBeAttached();
    await expect(momentScript).toBeAttached();

    // Verify async attribute is set
    const firstScript = scriptTags.first();
    const isAsync = await firstScript.getAttribute('async');
    expect(isAsync).toBe('');
  });

  test('should display loader data on the page', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Wait for the loader data to be displayed
    await page.waitForSelector('pre');

    // Check that loader data is shown
    const loaderData = page.locator('pre');
    await expect(loaderData).toBeVisible();

    // The loader data should contain our script URLs
    const content = await loaderData.textContent();
    expect(content).toContain('lodash');
    expect(content).toContain('moment');
  });

  test('should handle server-side rendering correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Check that the page is server-side rendered
    // The content should be available immediately without JavaScript
    await page.locator('h2').waitFor({ state: 'visible' });
    await expect(page.locator('h2')).toContainText('Features Tested:');

    // Check that the features list is rendered
    const features = page.locator('ul li');
    await expect(features).toHaveCount(4);
  });

  test('should work without JavaScript enabled', async ({ browser }) => {
    // Create a new context with JavaScript disabled
    const context = await browser.newContext({
      javaScriptEnabled: false
    });
    
    const page = await context.newPage();
    await page.goto('http://localhost:5173/');

    // Even without JavaScript, the server-rendered content should be visible
    await expect(page.locator('h1')).toContainText('React Router Framework Mode Test');
    await expect(page.locator('h2')).toContainText('Features Tested:');

    await context.close();
  });
});