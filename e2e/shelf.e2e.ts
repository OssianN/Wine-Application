import { expect, test, type Page } from '@playwright/test';
import { disconnectSeed, seedForeignWine } from './seed';

const password = 'e2e-shelf-password';
const wineTitle = 'Zzze2e Cellar Bottle';
const archivedComment = 'this was a gift from dad';
const replacementComment = 'Opened for the wedding';
const blockerTitle = 'Zzze2e Slot Blocker';

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

const wineCard = (target: Page) =>
  target.getByRole('article', { name: wineTitle });

const unarchiveDialog = (target: Page) =>
  target.getByRole('dialog', { name: 'Unarchive', exact: true });

const openArchivedWine = async (target: Page) => {
  await shelfTab(target, 2).click();
  await target.getByRole('row', { name: wineTitle }).click();
  const dialog = target.getByRole('dialog', { name: wineTitle });
  await dialog.waitFor();
  return dialog;
};

const editArchivedComment = async (target: Page, comment: string) => {
  const dialog = await openArchivedWine(target);
  await dialog.getByRole('button').first().click();
  await target.getByRole('button', { name: 'Edit' }).click();
  const editDialog = target.getByRole('dialog', { name: 'Edit Wine' });
  await editDialog.getByLabel('Comment', { exact: true }).fill(comment);
  await editDialog.getByRole('button', { name: 'Update' }).click();
  await expect(dialog).toContainText(comment);
  return dialog;
};

const openUnarchiveDialog = async (target: Page) => {
  const dialog = await openArchivedWine(target);
  await dialog.getByRole('button').first().click();
  await target.getByRole('button', { name: 'Unarchive' }).click();
  const unarchive = unarchiveDialog(target);
  await unarchive.waitFor();
  return unarchive;
};

const archiveNamedWine = async (target: Page) => {
  await shelfTab(target, 0).click();
  await wineCard(target).click();
  const dialog = target.getByRole('dialog', { name: wineTitle });
  await dialog.waitFor();
  await dialog.getByRole('button').first().click();
  await target.getByRole('button', { name: 'Archive' }).click();
  const confirm = target
    .locator('li')
    .filter({ hasText: 'Are you sure you want to archive' })
    .locator('button')
    .nth(1);
  await confirm.click();
  await expect(wineCard(target)).toHaveCount(0);
};

const confirmUnarchive = async (target: Page) => {
  const unarchive = unarchiveDialog(target);
  await unarchive.getByRole('button', { name: 'Confirm' }).click();
  await expect(unarchive).toBeHidden();
  await expect(target.getByRole('dialog')).toHaveCount(0);
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

  test('archived wine dialog still shows the comment', async () => {
    test.setTimeout(120_000);
    await editArchivedComment(page, archivedComment);
    await page.getByRole('button', { name: 'Close' }).click();

    const dialog = await openArchivedWine(page);
    await expect(dialog).toContainText(archivedComment);
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('unarchive shows the last position and escape keeps the wine archived', async () => {
    const unarchive = await openUnarchiveDialog(page);
    const lastSlot = unarchive.getByRole('button', { name: '1:3', exact: true });
    await expect(lastSlot).toBeVisible();
    await expect(lastSlot).toHaveAttribute('aria-pressed', 'true');
    await expect(unarchive.getByLabel('Comment', { exact: true })).toHaveValue(
      ''
    );
    await expect(unarchive).toContainText(archivedComment);
    await expect(
      unarchive.getByRole('button', { name: 'Use last comment' })
    ).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(unarchive).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('row', { name: wineTitle })).toBeVisible();

    const dialog = await openArchivedWine(page);
    await expect(dialog).toContainText(archivedComment);
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('an occupied slot is not offered and a blank comment restores the wine', async () => {
    test.setTimeout(120_000);
    await shelfTab(page, 0).click();
    await page.getByRole('button', { name: '1:3', exact: true }).click();
    const addDialog = page.getByRole('dialog', { name: 'Add wine' });
    await addDialog.getByLabel('Title').fill(blockerTitle);
    await addDialog.getByLabel('Year').fill('2019');
    await addDialog.getByLabel('Price').fill('15');
    await addDialog.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('article', { name: blockerTitle })).toBeVisible({
      timeout: 60_000,
    });

    const unarchive = await openUnarchiveDialog(page);
    await expect(
      unarchive.getByRole('button', { name: '1:3', exact: true })
    ).toHaveCount(0);
    await unarchive.getByRole('button', { name: '1:1', exact: true }).click();
    await expect(unarchive.getByLabel('Comment', { exact: true })).toHaveValue(
      ''
    );
    await confirmUnarchive(page);

    await shelfTab(page, 0).click();
    const card = wineCard(page);
    await expect(card).toContainText('1:1');
    await card.click();
    const dialog = page.getByRole('dialog', { name: wineTitle });
    await expect(dialog).not.toContainText(archivedComment);
    await dialog.getByRole('button').first().click();
    await page.getByRole('button', { name: 'Edit' }).click();
    const editDialog = page.getByRole('dialog', { name: 'Edit Wine' });
    await expect(editDialog.getByLabel('Comment', { exact: true })).toHaveValue(
      ''
    );
    await editDialog.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Close' }).click();

    await shelfTab(page, 2).click();
    await expect(page.getByRole('row', { name: wineTitle })).toHaveCount(0);
  });

  test('using the last comment saves it on the restored bottle', async () => {
    test.setTimeout(120_000);
    await archiveNamedWine(page);
    await editArchivedComment(page, archivedComment);
    await page.getByRole('button', { name: 'Close' }).click();

    const unarchive = await openUnarchiveDialog(page);
    await expect(
      unarchive.getByRole('button', { name: '1:1', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    await unarchive.getByRole('button', { name: 'Use last comment' }).click();
    await expect(unarchive.getByLabel('Comment', { exact: true })).toHaveValue(
      archivedComment
    );
    await confirmUnarchive(page);

    await shelfTab(page, 0).click();
    const card = wineCard(page);
    await expect(card).toContainText('1:1');
    await card.click();
    await expect(page.getByRole('dialog', { name: wineTitle })).toContainText(
      archivedComment
    );
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('a newly typed comment replaces the old one on the active bottle', async () => {
    await archiveNamedWine(page);
    const unarchive = await openUnarchiveDialog(page);
    await unarchive.getByLabel('Comment', { exact: true }).fill(replacementComment);
    await expect(unarchive.getByLabel('Comment', { exact: true })).toHaveValue(
      replacementComment
    );
    await confirmUnarchive(page);

    await shelfTab(page, 0).click();
    const card = wineCard(page);
    await expect(card).toContainText('1:1');
    await card.click();
    const dialog = page.getByRole('dialog', { name: wineTitle });
    await expect(dialog).toContainText(replacementComment);
    await expect(dialog).not.toContainText(archivedComment);
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('a slot occupied only by another account can be chosen', async () => {
    await archiveNamedWine(page);
    await seedForeignWine(1, 3);

    const unarchive = await openUnarchiveDialog(page);
    await unarchive.getByRole('button', { name: '2:4', exact: true }).click();
    await confirmUnarchive(page);

    await shelfTab(page, 0).click();
    await expect(wineCard(page)).toContainText('2:4');
    await shelfTab(page, 2).click();
    await expect(page.getByRole('row', { name: wineTitle })).toHaveCount(0);
  });
});
