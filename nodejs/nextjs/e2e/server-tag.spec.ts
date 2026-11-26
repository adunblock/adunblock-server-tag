import { test, expect } from '@playwright/test';

// test-app/src/app/layout.tsx renders <ServerTag> against /api/test-scripts,
// which lists jquery first, then lodash and one more.
const FIRST = 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js';

test('ServerTag prints one plain script tag, data-cfasync before src', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const head = html.slice(0, html.indexOf('</head>'));

  // A real tag in the HTML <head>, not next/script's inline __next_s push.
  expect(head).toContain(
    `<script data-cfasync="false" nowprocket="" src="${FIRST}" async="" data-code="12345678">`
  );
  expect(html).not.toContain('__next_s');
  // Only the preferred URL.
  expect(html).not.toContain('lodash.min.js');
});

test('the script tag is in the DOM', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(`head > script[src="${FIRST}"]`)).toHaveCount(1);
});
