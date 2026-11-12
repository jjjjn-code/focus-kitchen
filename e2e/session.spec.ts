import { expect, test, type Page } from '@playwright/test';

const MIN_TARGET = 5;
const TICK_PX = 9;

async function setTarget(page: Page, minutes: number, label: string) {
  const slider = page.getByRole('slider', { name: 'Target time in minutes' });
  await slider.evaluate((el, left) => el.scrollTo({ left }), (minutes - MIN_TARGET) * TICK_PX);
  await expect(page.getByTestId('target-readout')).toHaveText(label);
}

async function startCooking(page: Page, minutes = 10) {
  await page.clock.install();
  await page.goto('./');
  await page.getByRole('button', { name: 'Start cooking' }).click();
  await setTarget(page, minutes, `${minutes} min`);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('timer', { name: 'Time left' })).toBeVisible();
}

/** Drag the egg along its track; `fraction` 1 goes all the way to the end. */
async function slideEgg(page: Page, fraction: number) {
  const thumb = page.getByRole('button', { name: /^Slide to stop/ });
  const box = (await thumb.boundingBox())!;
  const y = box.y + box.height / 2;
  const x = box.x + box.width / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 100 * fraction, y, { steps: 4 });
  await page.mouse.move(x + 200 * fraction, y, { steps: 4 });
  await page.mouse.up();
}

async function setVisibility(page: Page, state: 'hidden' | 'visible') {
  await page.evaluate((value) => {
    Object.defineProperty(document, 'visibilityState', { value, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  }, state);
}

test('reaching the target and serving gives a cooked dish', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('04:00');
  await expect(page.getByRole('timer', { name: 'Time left' })).toHaveText('06:00');
  await page.clock.fastForward('06:00');
  await expect(page.getByRole('timer', { name: 'Time focused' })).toHaveText('10:00');
  await expect(page.getByText('Cooked! Keep going to upgrade')).toBeVisible();
  await expect(page.getByText('Next tier in 15 min')).toBeVisible();

  await page.getByRole('button', { name: 'Serve' }).click();
  await expect(page.getByText(/Snack · (common|rare|legendary)/i)).toBeVisible();
  await expect(page.getByText('New!')).toBeVisible();
  await expect(page.getByText('10 minutes of focus.')).toBeVisible();
  await expect(page.getByText('This week: 10 minutes')).toBeVisible();

  // A note is saved with the dish, which then shows in the recipe book.
  await page.getByRole('button', { name: 'Add a note' }).click();
  await page.getByRole('textbox', { name: 'Note' }).fill('Chapter three');
  await page.getByRole('button', { name: 'Add to recipe book' }).click();
  await expect(page.getByRole('heading', { name: 'Recipe book' })).toBeVisible();
  await expect(page.getByText('1 of 23')).toBeVisible();
  await page.getByRole('button', { name: /x1$/ }).click();
  await expect(page.getByText('Chapter three')).toBeVisible();
});

test('overtime upgrades the tier', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('46:00');
  await expect(page.getByText('Next tier in 29 min')).toBeVisible();
  await page.getByRole('button', { name: 'Serve' }).click();
  await expect(page.getByText(/Main · /)).toBeVisible();
});

test('sliding the egg before the target gives a raw dish', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('03:00');

  // Letting go part of the way does not stop the session.
  await slideEgg(page, 0.4);
  await expect(page.getByText('Your dish is not ready yet. Stop now and it comes out raw?')).toBeVisible();
  await expect(page.getByRole('timer', { name: 'Time left' })).toBeVisible();

  await slideEgg(page, 1);
  await expect(page.getByRole('heading', { name: /came out raw\.$/ })).toBeVisible();
  await expect(page.getByText('3 minutes of 10.')).toBeVisible();

  // Failures go to the mishaps page, not the recipe book.
  await page.getByRole('button', { name: 'Back to the kitchen' }).click();
  await page.getByRole('button', { name: 'Recipe book' }).click();
  await expect(page.getByText('0 of 23')).toBeVisible();
  await page.getByRole('button', { name: /Kitchen mishaps/ }).click();
  await expect(page.getByText('1 raw · 0 burnt')).toBeVisible();
  await expect(page.getByText(/3 of 10 min/)).toBeVisible();
});

test('a 5 minute session cooks a nibble', async ({ page }) => {
  await startCooking(page, 5);
  await page.clock.fastForward('05:00');
  await page.getByRole('button', { name: 'Serve' }).click();
  await expect(page.getByText(/Nibble · (common|rare)/i)).toBeVisible();
});

test('a short absence within the grace period carries on cooking', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('02:00');
  await setVisibility(page, 'hidden');
  await page.clock.fastForward(8000);
  await setVisibility(page, 'visible');
  await expect(page.getByRole('timer', { name: 'Time left' })).toBeVisible();
});

test('being away longer than the grace period burns the dish', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('04:00');
  await setVisibility(page, 'hidden');
  await page.clock.fastForward(11000);
  await setVisibility(page, 'visible');
  await expect(page.getByRole('heading', { name: 'You left the kitchen.' })).toBeVisible();
  await expect(page.getByText(/burnt\.$/)).toBeVisible();
  await expect(page.getByText('4 minutes of focus before you left.')).toBeVisible();
});

test('closing the app mid-session and reopening later burns the dish', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('02:00');
  // Leaving the page records the moment it was hidden.
  await page.goto('about:blank');
  await page.clock.fastForward('30:00');
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'You left the kitchen.' })).toBeVisible();
  await expect(page.getByText('2 minutes of focus before you left.')).toBeVisible();
});

test('reopening the app within the grace period carries on cooking', async ({ page }) => {
  await startCooking(page);
  await page.clock.fastForward('02:00');
  await page.goto('about:blank');
  await page.clock.fastForward(3000);
  await page.goto('./');
  await expect(page.getByRole('timer', { name: 'Time left' })).toBeVisible();
});

test('the target time slider starts at 15 minutes and the food changes with the time', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Start cooking' }).click();
  const readout = page.getByTestId('target-readout');
  const slider = page.getByRole('slider', { name: 'Target time in minutes' });
  const food = page.getByTestId('food-stage');
  await expect(readout).toHaveText('15 min');
  await expect(food).toHaveAccessibleName('Snack');

  await setTarget(page, 75, '1 hr 15 min');
  await expect(food).toHaveAccessibleName('Hearty');

  await page.getByRole('button', { name: '45 min', exact: true }).click();
  await expect(readout).toHaveText('45 min');
  await expect(slider).toHaveAttribute('aria-valuenow', '45');
  await expect(food).toHaveAccessibleName('Main');

  await page.getByRole('button', { name: '5 min', exact: true }).click();
  await expect(readout).toHaveText('5 min');
  await expect(food).toHaveAccessibleName('Nibble');

  await slider.press('ArrowRight');
  await expect(readout).toHaveText('10 min');
});
