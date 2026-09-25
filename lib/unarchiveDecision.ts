export type UnarchiveDecisionWine = {
  _id: string;
  archived?: boolean | null;
  shelf: number;
  column: number;
  comment?: string | null;
};

export type ActiveCellarWine = {
  _id: string;
  shelf: number;
  column: number;
};

export type UnarchiveUpdate = {
  archived: false;
  shelf: number;
  column: number;
  comment: string;
};

export type UnarchiveDecision =
  | { result: 'update'; update: UnarchiveUpdate }
  | { result: 'occupied' }
  | { result: 'not-found' };

export const unarchiveDecision = ({
  wine,
  owned,
  activeWines,
  shelf,
  column,
  comment,
}: {
  wine: UnarchiveDecisionWine | null;
  owned: boolean;
  activeWines: ActiveCellarWine[];
  shelf: number;
  column: number;
  comment: string;
}): UnarchiveDecision => {
  if (!wine || !owned || wine.archived !== true) {
    return { result: 'not-found' };
  }

  const occupied = activeWines.some(
    active =>
      active._id !== wine._id &&
      active.shelf === shelf &&
      active.column === column
  );

  if (occupied) {
    return { result: 'occupied' };
  }

  return {
    result: 'update',
    update: {
      archived: false,
      shelf,
      column,
      comment,
    },
  };
};
