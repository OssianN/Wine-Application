import {
  drinkingWindowFromWine,
  drinkingWindowStatusLabel,
  formatDrinkingWindow,
} from '@/lib/drinkingWindow';

export const LIST_WINES_DESCRIPTION = `Return the signed-in user's wine list.

HARD REQUIREMENT: Whenever you mention any wine from this list — in a recommendation, comparison, pairing, ranking, table, bullet list, or any other form — you MUST include all three of these for every bottle named:
- price (the price field, in kr; say unknown if missing)
- status (the status label such as Drink now or Past its peak; never a number)
- position (the 1-based shelf:column shown in the app, for example 2:5)

Omitting price, status, or position is incorrect. Each wine includes requiredInEveryReply with this data already formatted; copy that string whenever you mention the wine.`;

export const cellarPositionLabel = (shelf: number, column: number) =>
  `${shelf + 1}:${column + 1}`;

const formatPrice = (price?: number | null) =>
  price != null ? `${price} kr` : 'unknown';

type McpWineFields = {
  shelf: number;
  column: number;
  price?: number | null;
  drinkingWindowStart?: number | null;
  drinkingWindowEnd?: number | null;
  drinkingWindowStatus?: number | null;
};

export const wineForMcp = <T extends McpWineFields>(wine: T) => {
  const position = cellarPositionLabel(wine.shelf, wine.column);
  const status = drinkingWindowStatusLabel(wine.drinkingWindowStatus);
  const price = formatPrice(wine.price);

  return {
    ...wine,
    position,
    status,
    price: wine.price ?? null,
    drinkingWindow: formatDrinkingWindow(drinkingWindowFromWine(wine)),
    drinkingWindowStatus: status,
    requiredInEveryReply: `price ${price}, status ${status ?? 'unknown'}, position ${position}`,
  };
};
