import { test, expect } from '@playwright/test';

test('ServerTag should inject scripts', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for the scripts to be present in the head
  await page.waitForSelector('head > script[src="https://example.com/script1.js"]');
  await page.waitForSelector('head > script[src="https://example.com/script2.js"]');

  const script1 = await page.$('head > script[src="https://example.com/script1.js"]');
  const script2 = await page.$('head > script[src="https://example.com/script2.js"]');

  expect(script1).not.toBeNull();
  expect(script2).not.toBeNull();
});
