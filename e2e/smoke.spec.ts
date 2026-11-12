import { expect, test } from '@playwright/test';

test('the app loads and is installable', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Focus Kitchen' })).toBeVisible();

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await (await page.request.get(manifestHref!)).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('/focus-kitchen/');

  // The service worker takes control so the app works offline.
  await page.evaluate(() => navigator.serviceWorker.ready);
});
