import { searchWines } from './searchWines';
import type { Wine } from '@/types';

const wine = (overrides: Partial<Wine> & Pick<Wine, 'title'>): Wine => ({
  _id: overrides._id ?? overrides.title,
  country: '',
  year: 2010,
  comment: null,
  shelf: 0,
  column: 0,
  img: '',
  rating: '',
  price: null,
  vivinoUrl: null,
  ...overrides,
});

describe('searchWines', () => {
  it('matches title, country, region-in-country, and comment', () => {
    const titleHit = wine({ title: 'Réva Barolo Ravera' });
    const countryHit = wine({
      title: 'Other Red',
      country: 'Mendoza, Argentina',
    });
    const regionHit = wine({
      title: 'Estate Blend',
      country: 'Barolo, Italy',
    });
    const commentHit = wine({
      title: 'House White',
      comment: '170425 köpt av Niklas.',
    });
    const miss = wine({ title: 'Unrelated', country: 'Chile' });

    const wines = [titleHit, countryHit, regionHit, commentHit, miss];

    expect(searchWines(wines, 'barolo').map(item => item.title)).toEqual([
      'Réva Barolo Ravera',
      'Estate Blend',
    ]);
    expect(searchWines(wines, 'argentina').map(item => item.title)).toEqual([
      'Other Red',
    ]);
    expect(searchWines(wines, 'niklas').map(item => item.title)).toEqual([
      'House White',
    ]);
  });

  it('requires every token to match, across different fields', () => {
    const match = wine({
      title: 'Réva Barolo Ravera',
      comment: '170425 köpt av Niklas.',
    });
    const titleOnly = wine({ title: 'Réva Barolo Ravera' });
    const commentOnly = wine({
      title: 'House White',
      comment: 'köpt av Niklas',
    });

    expect(
      searchWines([match, titleOnly, commentOnly], 'barolo niklas').map(
        item => item.title
      )
    ).toEqual(['Réva Barolo Ravera']);
  });

  it('ignores diacritics and apostrophes', () => {
    const reva = wine({ title: 'Réva Barolo Ravera' });
    const nebbiolo = wine({
      title: 'Réva Nebbiolo d’Alba',
      country: "Nebbiolo d'Alba, Italien",
    });

    expect(searchWines([reva], 'reva').map(item => item.title)).toEqual([
      'Réva Barolo Ravera',
    ]);
    expect(searchWines([nebbiolo], 'dalba').map(item => item.title)).toEqual([
      'Réva Nebbiolo d’Alba',
    ]);
  });

  it('matches country aliases such as italy/italien', () => {
    const italien = wine({
      title: 'Réva Nebbiolo d’Alba',
      country: "Nebbiolo d'Alba, Italien",
    });
    const italy = wine({
      title: 'Réva Barolo Ravera',
      country: 'Barolo, Italy',
    });
    const france = wine({
      title: 'Bordeaux Rouge',
      country: 'Bordeaux, France',
    });

    expect(
      searchWines([italien, italy, france], 'italy')
        .map(item => item.title)
        .sort()
    ).toEqual(['Réva Barolo Ravera', 'Réva Nebbiolo d’Alba'].sort());
    expect(
      searchWines([italien, italy, france], 'italien')
        .map(item => item.title)
        .sort()
    ).toEqual(['Réva Barolo Ravera', 'Réva Nebbiolo d’Alba'].sort());
  });

  it('ranks title hits above country, then comments', () => {
    const titleHit = wine({
      title: 'Barolo',
      country: 'Piedmont, Italy',
      shelf: 5,
    });
    const countryHit = wine({
      title: 'Estate Blend',
      country: 'Barolo, Italy',
      shelf: 0,
    });
    const commentHit = wine({
      title: 'House White',
      comment: 'tastes like Barolo',
      shelf: 0,
    });

    expect(
      searchWines([commentHit, countryHit, titleHit], 'barolo').map(
        item => item.title
      )
    ).toEqual(['Barolo', 'Estate Blend', 'House White']);
  });

  it('prefers word-start title matches over mid-word title matches', () => {
    const wordStart = wine({ title: 'Barolo Cascina Francia', shelf: 2 });
    const midWord = wine({ title: 'Cabernet', comment: null, shelf: 0 });
    const midWordTitle = wine({ title: 'Xbarolo Reserve', shelf: 0 });

    expect(
      searchWines([midWordTitle, wordStart, midWord], 'bar').map(
        item => item.title
      )
    ).toEqual(['Barolo Cascina Francia', 'Xbarolo Reserve']);
  });

  it('returns every wine in numeric shelf then column order when the query is empty', () => {
    const wines = [
      wine({ title: 'C', shelf: 2, column: 0 }),
      wine({ title: 'B', shelf: 1, column: 10 }),
      wine({ title: 'A', shelf: 1, column: 2 }),
    ];

    expect(searchWines(wines, '').map(item => item.title)).toEqual([
      'A',
      'B',
      'C',
    ]);
    expect(searchWines(wines, '   ').map(item => item.title)).toEqual([
      'A',
      'B',
      'C',
    ]);
  });

  it('breaks tied scores with numeric shelf then column', () => {
    const later = wine({
      title: 'Later',
      country: 'Barolo, Italy',
      shelf: 1,
      column: 10,
    });
    const earlier = wine({
      title: 'Earlier',
      country: 'Barolo, Italy',
      shelf: 1,
      column: 2,
    });
    const nextShelf = wine({
      title: 'Next shelf',
      country: 'Barolo, Italy',
      shelf: 2,
      column: 0,
    });

    expect(
      searchWines([later, nextShelf, earlier], 'barolo').map(item => item.title)
    ).toEqual(['Earlier', 'Later', 'Next shelf']);
  });
});
