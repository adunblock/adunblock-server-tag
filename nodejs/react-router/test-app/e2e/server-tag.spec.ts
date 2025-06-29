import { test, expect } from '@playwright/test';

test('ServerTag should inject scripts', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for the scripts to be present in the head
  await page.waitForFunction(() => {
    const script1 = document.querySelector('head > script[src="https://example.com/script1.js"]');
    const script2 = document.querySelector('head > script[src="https://example.com/script2.js"]');
    return script1 && script2;
  });

  const script1 = await page.$('head > script[src="https://example.com/script1.js"]');
  const script2 = await page.$('head > script[src="https://example.com/script2.js"]');

  expect(script1).not.toBeNull();
  expect(script2).not.toBeNull();
});
