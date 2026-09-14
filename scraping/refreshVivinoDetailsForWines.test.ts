/**
 * @jest-environment node
 */
import { refreshVivinoDetailsForWines } from './refreshVivinoDetailsForWines';
import { getVivinoDetailsForWine } from './getVivinoDetails';
import { getDrinkingWindowForVintage } from './getDrinkingWindow';
import { getVivinoPricesForVintages } from './getVivinoPrice';

jest.mock('./getVivinoDetails', () => ({
  getVivinoDetailsForWine: jest.fn(),
}));
jest.mock('./getDrinkingWindow', () => ({
  getDrinkingWindowForVintage: jest.fn(),
}));
jest.mock('./getVivinoPrice', () => ({
  getVivinoPricesForVintages: jest.fn(),
}));

const mockGetVivinoDetailsForWine = getVivinoDetailsForWine as jest.MockedFunction<
  typeof getVivinoDetailsForWine
>;
const mockGetDrinkingWindowForVintage =
  getDrinkingWindowForVintage as jest.MockedFunction<
    typeof getDrinkingWindowForVintage
  >;
const mockGetVivinoPricesForVintages =
  getVivinoPricesForVintages as jest.MockedFunction<
    typeof getVivinoPricesForVintages
  >;

describe('refreshVivinoDetailsForWines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('batches prices for wines with a vintage id and falls back per wine otherwise', async () => {
    mockGetVivinoPricesForVintages.mockResolvedValue(
      new Map([
        [111, 499],
        [222, 650],
      ])
    );
    mockGetDrinkingWindowForVintage.mockImplementation(async vintageId => ({
      vintageId,
      drinkingWindowStart: 2018,
      drinkingWindowEnd: 2024,
      drinkingWindowStatus: 5,
    }));
    mockGetVivinoDetailsForWine.mockResolvedValue({
      price: 320,
      vintageId: 333,
      drinkingWindowStart: 2020,
      drinkingWindowEnd: 2028,
      drinkingWindowStatus: 4,
    });

    const result = await refreshVivinoDetailsForWines([
      {
        _id: 'with-vintage',
        vintageId: 111,
        title: 'Priced wine',
        year: 2016,
      },
      {
        _id: 'from-url',
        vivinoUrl: 'https://www.vivino.com/SE/sv/wines/222',
        title: 'URL vintage',
        year: 2018,
      },
      {
        _id: 'no-vintage',
        title: 'Needs checkout',
        year: 2019,
        vivinoUrl:
          'https://www.vivino.com/SE/sv/ossian/w/6142915?year=2019',
      },
      {
        _id: 'skipped-no-ids',
        title: 'Unknown bottle',
      },
      {
        _id: 'archived',
        archived: true,
        vintageId: 999,
      },
    ]);

    expect(mockGetVivinoPricesForVintages).toHaveBeenCalledTimes(1);
    expect(mockGetVivinoPricesForVintages).toHaveBeenCalledWith([111, 222]);
    expect(mockGetVivinoDetailsForWine).toHaveBeenCalledTimes(1);
    expect(mockGetVivinoDetailsForWine).toHaveBeenCalledWith({
      wineId: 6142915,
      year: 2019,
      vintageId: null,
      title: 'Needs checkout',
    });
    expect(mockGetDrinkingWindowForVintage).toHaveBeenCalledTimes(2);

    expect(result.updated).toBe(3);
    expect(result.skipped).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.updates).toEqual([
      {
        wineId: 'with-vintage',
        currentPrice: 499,
        drinkingWindowStart: 2018,
        drinkingWindowEnd: 2024,
        drinkingWindowStatus: 5,
      },
      {
        wineId: 'from-url',
        currentPrice: 650,
        drinkingWindowStart: 2018,
        drinkingWindowEnd: 2024,
        drinkingWindowStatus: 5,
      },
      {
        wineId: 'no-vintage',
        currentPrice: 320,
        vintageId: 333,
        drinkingWindowStart: 2020,
        drinkingWindowEnd: 2028,
        drinkingWindowStatus: 4,
      },
    ]);
  });

  it('does not persist null fields when a scrape returns nothing', async () => {
    mockGetVivinoPricesForVintages.mockResolvedValue(new Map());
    mockGetDrinkingWindowForVintage.mockResolvedValue(undefined);
    mockGetVivinoDetailsForWine.mockResolvedValue({
      price: null,
      vintageId: null,
      drinkingWindowStart: null,
      drinkingWindowEnd: null,
      drinkingWindowStatus: null,
    });

    const result = await refreshVivinoDetailsForWines([
      { _id: 'a', vintageId: 111, year: 2016, title: 'A' },
      {
        _id: 'b',
        year: 2016,
        title: 'B',
        vivinoUrl: 'https://www.vivino.com/SE/sv/ossian/w/6142915?year=2016',
      },
    ]);

    expect(result.updates).toEqual([]);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(2);
    expect(result.failed).toBe(0);
  });

  it('refreshes wines that only have a title and year', async () => {
    mockGetVivinoDetailsForWine.mockResolvedValue({
      price: 499,
      vintageId: 156524504,
      drinkingWindowStart: 2018,
      drinkingWindowEnd: 2024,
      drinkingWindowStatus: 5,
    });

    const result = await refreshVivinoDetailsForWines([
      { _id: 'title-year', title: 'Sassicaia', year: 2016 },
    ]);

    expect(mockGetVivinoDetailsForWine).toHaveBeenCalledWith({
      wineId: null,
      year: 2016,
      vintageId: null,
      title: 'Sassicaia',
    });
    expect(result).toMatchObject({
      updated: 1,
      skipped: 0,
      failed: 0,
    });
    expect(result.updates).toEqual([
      {
        wineId: 'title-year',
        currentPrice: 499,
        vintageId: 156524504,
        drinkingWindowStart: 2018,
        drinkingWindowEnd: 2024,
        drinkingWindowStatus: 5,
      },
    ]);
  });

  it('counts a thrown details fetch as failed', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetVivinoPricesForVintages.mockResolvedValue(new Map());
    mockGetVivinoDetailsForWine.mockRejectedValue(new Error('vivino down'));

    const result = await refreshVivinoDetailsForWines([
      {
        _id: 'b',
        year: 2016,
        title: 'B',
        vivinoUrl: 'https://www.vivino.com/SE/sv/ossian/w/6142915?year=2016',
      },
    ]);

    expect(result.failed).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.updates).toEqual([]);
    errorSpy.mockRestore();
  });
});
