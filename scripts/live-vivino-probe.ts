/**
 * One-off live probe against Vivino's unofficial APIs.
 * Not part of `yarn test`. Does not write to Mongo.
 *
 *   npx tsx scripts/live-vivino-probe.ts
 */
import { writeFileSync } from 'node:fs';
import { titleYearWineLibrary } from '../__fixtures__/titleYearWineLibrary';
import { refreshVivinoDetailsForWines } from '../scraping/refreshVivinoDetailsForWines';

delete process.env.JEST_WORKER_ID;

const main = async () => {
  const wines = titleYearWineLibrary;
  const started = Date.now();
  console.error(
    `Live Vivino probe: ${wines.length} title+year wines (no Mongo writes)`
  );

  const result = await refreshVivinoDetailsForWines(wines);
  const elapsedMs = Date.now() - started;
  const byId = new Map(wines.map(wine => [wine._id, wine]));
  const updatedIds = new Set(result.updates.map(update => update.wineId));

  const rows = result.updates.map(update => {
    const wine = byId.get(update.wineId);
    return {
      title: wine?.title ?? null,
      year: wine?.year ?? null,
      currentPrice: update.currentPrice ?? null,
      vintageId: update.vintageId ?? null,
      drinkingWindowStart: update.drinkingWindowStart ?? null,
      drinkingWindowEnd: update.drinkingWindowEnd ?? null,
      drinkingWindowStatus: update.drinkingWindowStatus ?? null,
    };
  });

  const summary = {
    elapsedMs,
    updated: result.updated,
    skipped: result.skipped,
    failed: result.failed,
    withPrice: rows.filter(row => row.currentPrice != null).length,
    withVintageId: rows.filter(row => row.vintageId != null).length,
    withDrinkingWindow: rows.filter(
      row =>
        row.drinkingWindowStart != null ||
        row.drinkingWindowEnd != null ||
        row.drinkingWindowStatus != null
    ).length,
    notUpdated: wines
      .filter(wine => !updatedIds.has(wine._id))
      .map(wine => ({ title: wine.title, year: wine.year })),
    rows,
  };

  const outputPath =
    process.env.LIVE_VIVINO_PROBE_OUT ??
    '/opt/cursor/artifacts/vivino-live-probe.json';
  try {
    writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
    console.error(`Wrote ${outputPath}`);
  } catch (error) {
    console.error('Could not write artifact file:', error);
  }

  console.log(JSON.stringify(summary, null, 2));
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
