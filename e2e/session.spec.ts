import { expect, test, type Page } from '@playwright/test';

async function startCooking(page: Page, target = '10 min') {
  await page.clock.install();
  await page.goto('./');
  await page.getByRole('button', { name: 'Start cooking' }).click();
  await page.getByRole('radio', { name: target, exact: true }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Hold to stop' })).toBeVisible();
}

async function setVisibility(page: Page, state: 'hidden' | 'visible') {
  await page.evaluate((value) => {
    Object.defineProperty(document, 'visibilityState', { value, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  }, state);
}

test('reaching the target and serving gives a cooked dish', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('10:00');
  await expect(page.getByText('Cooked! Keep going to upgrade')).toBeVisible();
  await expect(page.getByText('Next tier in 15 min')).toBeVisible();

  await page.getByRole('button', { name: 'Serve' }).click();
  await expect(page.getByText(/Snack · (common|rare|legendary)/i)).toBeVisible();
  await expect(page.getByText('10 minutes of reading.')).toBeVisible();

  await page.getByRole('button', { name: 'Back to the kitchen' }).click();
  await expect(page.getByText('Dishes cooked so far: 1')).toBeVisible();
});

test('overtime upgrades the tier', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('46:00');
  await expect(page.getByText('Next tier in 29 min')).toBeVisible();
  await page.getByRole('button', { name: 'Serve' }).click();
  await expect(page.getByText(/Main · /)).toBeVisible();
});

test('holding stop before the target gives a raw dish', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('03:00');
  const stop = page.getByRole('button', { name: 'Hold to stop' });

  // A short press does not stop the session.
  await stop.dispatchEvent('pointerdown');
  await page.clock.fastForward(500);
  await stop.dispatchEvent('pointerup');
  await expect(page.getByText('Your dish is not ready yet. Stop now and it comes out raw?')).toBeVisible();
  await expect(stop).toBeVisible();

  await stop.dispatchEvent('pointerdown');
  await page.clock.fastForward(1600);
  await expect(page.getByRole('heading', { name: /came out raw\.$/ })).toBeVisible();
  await expect(page.getByText('You focused for 3 minutes of your 10.')).toBeVisible();
});

test('a short absence within the grace period carries on cooking', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('02:00');
  await setVisibility(page, 'hidden');
  await page.clock.fastForward(8000);
  await setVisibility(page, 'visible');
  await expect(page.getByRole('button', { name: 'Hold to stop' })).toBeVisible();
});

test('being away longer than the grace period burns the dish', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('04:00');
  await setVisibility(page, 'hidden');
  await page.clock.fastForward(11000);
  await setVisibility(page, 'visible');
  await expect(page.getByRole('heading', { name: 'You left the kitchen.' })).toBeVisible();
  await expect(page.getByText(/burnt\.$/)).toBeVisible();
  await expect(page.getByText('You focused for 4 minutes before it went wrong.')).toBeVisible();
});

test('closing the app mid-session and reopening later burns the dish', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('02:00');
  // Leaving the page records the moment it was hidden.
  await page.goto('about:blank');
  await page.clock.fastForward('30:00');
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'You left the kitchen.' })).toBeVisible();
  await expect(page.getByText('You focused for 2 minutes before it went wrong.')).toBeVisible();
});

test('reopening the app within the grace period carries on cooking', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('02:00');
  await page.goto('about:blank');
  await page.clock.fastForward(3000);
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Hold to stop' })).toBeVisible();
});
