import { unarchiveDecision } from './unarchiveDecision';

const ownedArchivedWine = {
  _id: 'archived-wine',
  archived: true,
  shelf: 0,
  column: 2,
  comment: 'this was a gift from dad',
};

describe('unarchiveDecision', () => {
  it.each(['', 'this was a gift from dad', 'a new note'])(
    'updates an owned archived wine with the submitted comment %j',
    comment => {
      expect(
        unarchiveDecision({
          wine: ownedArchivedWine,
          owned: true,
          activeWines: [],
          shelf: 1,
          column: 3,
          comment,
        })
      ).toEqual({
        result: 'update',
        update: {
          archived: false,
          shelf: 1,
          column: 3,
          comment,
        },
      });
    }
  );

  it('accepts the previous slot when no active bottle is there', () => {
    expect(
      unarchiveDecision({
        wine: ownedArchivedWine,
        owned: true,
        activeWines: [],
        shelf: ownedArchivedWine.shelf,
        column: ownedArchivedWine.column,
        comment: '',
      })
    ).toEqual({
      result: 'update',
      update: {
        archived: false,
        shelf: 0,
        column: 2,
        comment: '',
      },
    });
  });

  it('returns occupied and no update when another active bottle is in the slot', () => {
    expect(
      unarchiveDecision({
        wine: ownedArchivedWine,
        owned: true,
        activeWines: [{ _id: 'other-active', shelf: 0, column: 2 }],
        shelf: 0,
        column: 2,
        comment: 'kept',
      })
    ).toEqual({ result: 'occupied' });
  });

  it('accepts a target that is not in this account’s active list', () => {
    expect(
      unarchiveDecision({
        wine: ownedArchivedWine,
        owned: true,
        activeWines: [{ _id: 'other-active', shelf: 4, column: 4 }],
        shelf: 0,
        column: 2,
        comment: 'note',
      })
    ).toEqual({
      result: 'update',
      update: {
        archived: false,
        shelf: 0,
        column: 2,
        comment: 'note',
      },
    });
  });

  it.each([
    ['missing', null, true],
    ['not owned', ownedArchivedWine, false],
    ['not archived', { ...ownedArchivedWine, archived: false }, true],
  ] as const)(
    'returns not-found and no update when the wine is %s',
    (_label, wine, owned) => {
      expect(
        unarchiveDecision({
          wine,
          owned,
          activeWines: [],
          shelf: 0,
          column: 0,
          comment: 'nope',
        })
      ).toEqual({ result: 'not-found' });
    }
  );
});
