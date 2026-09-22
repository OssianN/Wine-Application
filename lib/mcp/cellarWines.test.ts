import { cellarWineFromDocument } from './cellarWines';
import type { Wine } from '@/types';

describe('cellarWineFromDocument', () => {
  it('keeps the stored drinking-window numbers and archived flag', () => {
    const wine: Wine = {
      _id: 'wine-1',
      title: 'Barolo',
      country: 'Italy',
      year: 2016,
      comment: 'save for Sunday',
      shelf: 1,
      column: 2,
      archived: false,
      img: 'https://images.example/barolo.jpg',
      rating: '4.5',
      price: 40,
      currentPrice: 55,
      vintageId: 99,
      vivinoUrl: 'https://www.vivino.com/wines/1',
      drinkingWindowStart: 2022,
      drinkingWindowEnd: 2040,
      drinkingWindowStatus: 5,
    };

    expect(cellarWineFromDocument(wine)).toEqual({
      title: 'Barolo',
      year: 2016,
      country: 'Italy',
      rating: '4.5',
      price: 40,
      currentPrice: 55,
      comment: 'save for Sunday',
      shelf: 1,
      column: 2,
      archived: false,
      vivinoUrl: 'https://www.vivino.com/wines/1',
      drinkingWindowStart: 2022,
      drinkingWindowEnd: 2040,
      drinkingWindowStatus: 5,
    });
  });

  it('treats a missing archived flag as not archived', () => {
    const wine = {
      _id: 'wine-2',
      title: 'Rioja',
      country: 'Spain',
      year: 2018,
      comment: null,
      shelf: 0,
      column: 1,
      img: '',
      rating: '',
      price: null,
      vivinoUrl: null,
    } as Wine;

    expect(cellarWineFromDocument(wine).archived).toBe(false);
  });
});
