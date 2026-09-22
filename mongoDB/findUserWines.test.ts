/**
 * @jest-environment node
 */

process.env.MONGODB_URI ??= 'mongodb://localhost:27017/test';

import type { Wine } from '@/types';
import { findUserWines } from './findUserWines';
import { getUserWine } from './getUserWine';
import UserDataBase from './user-schema';
import WineDataBase from './wine-schema';

jest.mock('./index', () => ({
  connectMongo: jest.fn(),
}));
jest.mock('./user-schema', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));
jest.mock('./wine-schema', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

const mockUser = UserDataBase as unknown as {
  findById: jest.Mock;
};
const mockWine = WineDataBase as unknown as {
  find: jest.Mock;
};

const cellar: Wine[] = [
  {
    _id: 'wine-1',
    title: 'Barolo',
    country: 'Italy',
    year: 2016,
    comment: null,
    shelf: 1,
    column: 2,
    archived: false,
    img: '',
    rating: '4.5',
    price: 40,
    currentPrice: 55,
    vivinoUrl: 'https://www.vivino.com/wines/1',
    drinkingWindowStart: 2022,
    drinkingWindowEnd: 2040,
    drinkingWindowStatus: 5,
  },
  {
    _id: 'wine-2',
    title: 'Old Rioja',
    country: 'Spain',
    year: 2001,
    comment: 'finished',
    shelf: 0,
    column: 0,
    archived: true,
    img: '',
    rating: '4.0',
    price: 20,
    vivinoUrl: null,
  },
];

const leanQuery = (value: unknown) => ({
  lean: jest.fn().mockResolvedValue(value),
});

describe('findUserWines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns every wine on the user list', async () => {
    mockUser.findById.mockResolvedValue({ wineList: ['wine-1', 'wine-2'] });
    mockWine.find.mockReturnValue(leanQuery(cellar));

    await expect(findUserWines('user-1')).resolves.toEqual(cellar);
    expect(mockWine.find).toHaveBeenCalledWith({
      _id: { $in: ['wine-1', 'wine-2'] },
    });
  });

  it('returns an empty list when the user is missing', async () => {
    mockUser.findById.mockResolvedValue(null);

    await expect(findUserWines('missing')).resolves.toEqual([]);
    expect(mockWine.find).not.toHaveBeenCalled();
  });
});

describe('getUserWine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser.findById.mockResolvedValue({ wineList: ['wine-1', 'wine-2'] });
    mockWine.find.mockReturnValue(leanQuery(cellar));
  });

  it('keeps the dashboard filter for the active cellar', async () => {
    await expect(getUserWine({ _id: 'user-1' })).resolves.toEqual([cellar[0]]);
  });

  it('keeps the dashboard filter for archived bottles', async () => {
    await expect(
      getUserWine({ _id: 'user-1', isArchived: true })
    ).resolves.toEqual([cellar[1]]);
  });
});
