import { expect, test, type Page } from '@playwright/test';

async function cook(page: Page, minutes: number) {
  await page.getByRole('button', { name: 'Start cooking' }).click();
  const slider = page.getByRole('slider', { name: 'Target time in minutes' });
  await slider.evaluate((el, left) => el.scrollTo({ left }), (minutes - 5) * 9);
  await expect(page.getByTestId('target-readout')).toHaveText(`${minutes} min`);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.fastForward(minutes * 60_000);
  await page.getByRole('button', { name: 'Serve' }).click();
  await page.getByRole('button', { name: 'Add to recipe book' }).click();
}

test('dishes cooked for a goal are served together as a feast', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await page.getByRole('button', { name: 'Goals' }).click();
  await page.getByRole('textbox', { name: 'New goal' }).fill('Atomic Habits');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cooking for this' })).toBeVisible();

  await page.getByRole('button', { name: 'Kitchen', exact: true }).click();
  await expect(page.getByText('For Atomic Habits')).toBeVisible();
  await cook(page, 10);
  await page.getByRole('button', { name: 'Kitchen', exact: true }).click();
  await cook(page, 5);

  await page.getByRole('button', { name: 'Goals' }).click();
  await expect(page.getByText('15 min · 2 dishes')).toBeVisible();
  await page.getByRole('button', { name: 'Mark as finished' }).click();
  await expect(page.getByRole('heading', { name: 'The Atomic Habits feast' })).toBeVisible();
  await expect(page.getByRole('img', { name: '2 dishes on a table' })).toBeVisible();

  // The finished goal no longer collects sessions.
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Kitchen', exact: true }).click();
  await expect(page.getByText('For Atomic Habits')).toBeHidden();
});

test('the kitchen and stats show the totals', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await cook(page, 15);
  await page.getByRole('button', { name: 'Kitchen', exact: true }).click();
  await expect(page.getByText('15 min')).toBeVisible();
  await expect(page.getByText('1 day', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Stats' }).click();
  await expect(page.getByRole('list', { name: 'Minutes per day for the last 14 days' }).getByRole('listitem')).toHaveCount(14);
  await expect(page.getByText('Longest session')).toBeVisible();
  await expect(page.getByText('Close calls')).toBeVisible();
});

test('the grace period can be shortened in settings', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('radio', { name: '5 seconds' }).click();
  await page.getByRole('button', { name: 'Back' }).click();

  await page.getByRole('button', { name: 'Start cooking' }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.fastForward('01:00');
  // 8 seconds away survives the default 10 second grace period, but not 5.
  for (const state of ['hidden', 'visible'] as const) {
    await page.evaluate((value) => {
      Object.defineProperty(document, 'visibilityState', { value, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    }, state);
    if (state === 'hidden') await page.clock.fastForward(8000);
  }
  await expect(page.getByRole('heading', { name: 'You left the kitchen.' })).toBeVisible();
});

test('data can be exported and imported again', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await cook(page, 10);
  await page.getByRole('button', { name: 'Kitchen', exact: true }).click();
  await page.getByRole('button', { name: 'Settings' }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export data' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^focus-kitchen-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();
  await expect(page.getByRole('status')).toHaveText('Exported 1 sessions.');

  // Wipe the device, then restore from the file.
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('focus-kitchen');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const tx = open.result.transaction(['sessions', 'goals'], 'readwrite');
          tx.objectStore('sessions').clear();
          tx.objectStore('goals').clear();
          tx.oncomplete = () => resolve();
        };
      }),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Recipe book' }).click();
  await expect(page.getByText('0 of 23')).toBeVisible();

  await page.getByRole('button', { name: 'Kitchen', exact: true }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  page.on('dialog', (dialog) => void dialog.accept());
  await page.locator('input[type="file"]').setInputFiles(path);
  await expect(page.getByRole('status')).toHaveText('Imported 1 sessions.');
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Recipe book' }).click();
  await expect(page.getByText('1 of 23')).toBeVisible();
});
