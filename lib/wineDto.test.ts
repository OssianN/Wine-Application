import type { ScrapingResult } from '@/types';

import { wineDto } from './wineDto';

describe('wineDto', () => {
  const scraping: ScrapingResult = {
    currentPrice: 6503,
    vintageId: 127064316,
    rating: '4.7',
    drinkingWindow: {
      startYear: 2021,
      endYear: 2036,
      status: 4,
    },
  };

  it('does not copy merchant currentPrice into purchase price', () => {
    expect(
      wineDto({
        title: 'Barolo Cascina Francia',
        year: 2016,
        scraping,
      })
    ).toMatchObject({
      price: null,
      currentPrice: 6503,
      vintageId: 127064316,
      drinkingWindow: {
        startYear: 2021,
        endYear: 2036,
        status: 4,
      },
    });
  });

  it('keeps a user-entered purchase price', () => {
    expect(
      wineDto({
        title: 'Barolo Cascina Francia',
        year: 2016,
        price: 200,
        scraping,
      }).price
    ).toBe(200);
  });
});
