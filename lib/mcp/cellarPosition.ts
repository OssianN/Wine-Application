export const cellarPositionLabel = (shelf: number, column: number) =>
  `${shelf + 1}:${column + 1}`;

export const withCellarPosition = <T extends { shelf: number; column: number }>(
  wine: T
) => ({
  ...wine,
  position: cellarPositionLabel(wine.shelf, wine.column),
});
