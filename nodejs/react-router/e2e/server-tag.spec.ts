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

    // One tag, for the preferred (first) URL, with data-cfasync ahead of src
    // so Cloudflare Rocket Loader leaves it alone.
    const html = await (await page.request.get('http://localhost:5173/')).text();
    expect(html).toMatch(
      /<script data-cfasync="false" nowprocket="" src="https:[^"]+" async="" data-code="12345678">/
    );
    await expect(page.locator('script[data-code="12345678"]')).toHaveCount(1);
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