import { expect, test, type Page } from '@playwright/test';
import { disconnectSeed, seedForeignWine } from './seed';

const password = 'e2e-shelf-password';
const wineTitle = 'Zzze2e Cellar Bottle';

let page: Page;
let email: string;

const shelfTab = (target: Page, index: number) =>
  target.getByRole('tab').nth(index);

const dragWineToSlot = async (target: Page, slotName: string) => {
  const article = target.getByRole('article');
  const handle = article.getByRole('button').first();
  const slot = target.getByRole('button', { name: slotName, exact: true });
  await slot.scrollIntoViewIfNeeded();

  const handleBox = await handle.boundingBox();
  const articleBox = await article.boundingBox();
  const slotBox = await slot.boundingBox();
  if (!handleBox || !articleBox || !slotBox) {
    throw new Error(`Could not measure the wine card or slot ${slotName}`);
  }

  const startX = handleBox.x + handleBox.width / 2;
  const startY = handleBox.y + handleBox.height / 2;
  const deltaX =
    slotBox.x + slotBox.width / 2 - (articleBox.x + articleBox.width / 2);
  const deltaY =
    slotBox.y + slotBox.height / 2 - (articleBox.y + articleBox.height / 2);

  await target.mouse.move(startX, startY);
  await target.mouse.down();
  await target.mouse.move(startX + deltaX, startY + deltaY, { steps: 20 });
  await target.mouse.up();
};

const openWineMenu = async (target: Page) => {
  await target.getByRole('article').click();
  const dialog = target.getByRole('dialog');
  await dialog.waitFor();
  await dialog.getByRole('button').first().click();
};

test.describe.serial('wine shelf', () => {
  test.beforeAll(async ({ browser }) => {
    email = `e2e-shelf-${Date.now()}@example.com`;
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await disconnectSeed();
    await page?.context().close();
  });

  test.afterEach(async () => {
    if (!page || page.isClosed()) return;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const dialog = page.getByRole('dialog');
      if (!(await dialog.isVisible().catch(() => false))) return;
      await page.keyboard.press('Escape');
    }
  });

  test('register opens an empty shelf', async () => {
    await page.goto('/register');
    await page.getByLabel('Your name').fill('E2E Shelf User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('button', { name: '1:1' })).toBeVisible();
    await expect(page.getByRole('button', { name: '8:8' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(0);
  });

  test('empty cellar storage stats stay numeric', async () => {
    await page.locator('button[aria-haspopup="dialog"]').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('E2E Shelf User')).toBeVisible();
    const stats = await dialog.innerText();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    expect(stats).not.toContain('NaN');
    expect(stats).toContain('Average year:');
    expect(stats).toContain('0');
  });

  test('add, edit, browse, and search a wine', async () => {
    test.setTimeout(120_000);

    await page.getByRole('button', { name: '1:1' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Add wine' })).toBeVisible();
    await dialog.getByLabel('Title').fill(wineTitle);
    await dialog.getByLabel('Year').fill('2018');
    await dialog.getByLabel('Price').fill('42');
    await dialog.getByLabel('Comment').fill('Cellar note for search');
    await dialog.getByRole('button', { name: 'Add' }).click();

    const card = page.getByRole('article');
    await expect(card.getByRole('heading', { name: wineTitle })).toBeVisible({
      timeout: 60_000,
    });
    await expect(card).toContainText('1:1');
    await expect(card).toContainText('42');

    await openWineMenu(page);
    await page.getByRole('button', { name: 'Edit' }).click();
    const editDialog = page.getByRole('dialog');
    await editDialog.getByLabel('Comment', { exact: true }).fill('Updated cellar note');
    await editDialog.getByRole('button', { name: 'Update' }).click();
    await expect(editDialog).toContainText('Updated cellar note');
    await editDialog.getByRole('button', { name: 'Close' }).click();

    await shelfTab(page, 1).click();
    const wineRow = page.getByRole('row', { name: wineTitle });
    await expect(wineRow).toBeVisible();

    const search = page.getByRole('searchbox', {
      name: 'Search name, country, region, comments',
    });
    await search.fill('Updated cellar note');
    await expect(wineRow).toBeVisible();
    await search.fill('zzzz-no-match');
    await expect(wineRow).toHaveCount(0);
    await search.fill('');
    await expect(wineRow).toBeVisible();

    await shelfTab(page, 0).click();
    await expect(page.getByRole('article')).toContainText(wineTitle);
  });

  test('move a wine onto an empty slot in this cellar', async () => {
    await dragWineToSlot(page, '1:2');
    await expect(page.getByText('Wine Moved', { exact: true })).toBeVisible();
    await expect(page.getByRole('article')).toContainText('1:2');
  });

  test('move still works when only another account uses that slot', async () => {
    await seedForeignWine(0, 2);
    await dragWineToSlot(page, '1:3');

    await expect(page.getByRole('article')).toContainText('1:3');
    await expect(page.getByText('Could not move wine', { exact: true })).toHaveCount(0);
  });

  test('archive a wine, then find it again after logging back in', async () => {
    await openWineMenu(page);
    await page.getByRole('button', { name: 'Archive' }).click();
    const confirm = page
      .locator('li')
      .filter({ hasText: 'Are you sure you want to archive' })
      .locator('button')
      .nth(1);
    await confirm.click();

    await expect(page.getByRole('article')).toHaveCount(0);
    await shelfTab(page, 2).click();
    await expect(page.getByRole('row', { name: wineTitle })).toBeVisible();

    await page.locator('button[aria-haspopup="dialog"]').first().click();
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await shelfTab(page, 0).click();
    await expect(page.getByRole('article')).toHaveCount(0);
    await shelfTab(page, 2).click();
    await expect(page.getByRole('row', { name: wineTitle })).toBeVisible();
  });
});
