import {
  drinkingWindowFromWine,
  drinkingWindowStatusLabel,
  formatDrinkingWindow,
} from '@/lib/drinkingWindow';

export const cellarPositionLabel = (shelf: number, column: number) =>
  `${shelf + 1}:${column + 1}`;

type McpWineFields = {
  shelf: number;
  column: number;
  drinkingWindowStart?: number | null;
  drinkingWindowEnd?: number | null;
  drinkingWindowStatus?: number | null;
};

export const wineForMcp = <T extends McpWineFields>(wine: T) => ({
  ...wine,
  position: cellarPositionLabel(wine.shelf, wine.column),
  drinkingWindow: formatDrinkingWindow(drinkingWindowFromWine(wine)),
  drinkingWindowStatus: drinkingWindowStatusLabel(wine.drinkingWindowStatus),
});
