import { cellarPositionLabel, wineForMcp } from './cellarPosition';

describe('cellarPositionLabel', () => {
  it('uses the same 1-based shelf:column numbers as the app', () => {
    expect(cellarPositionLabel(0, 0)).toBe('1:1');
    expect(cellarPositionLabel(2, 5)).toBe('3:6');
  });
});

describe('wineForMcp', () => {
  it('adds position and replaces the status code with its label', () => {
    expect(
      wineForMcp({
        title: 'Barolo',
        shelf: 1,
        column: 3,
        drinkingWindowStart: 2018,
        drinkingWindowEnd: 2028,
        drinkingWindowStatus: 5,
      })
    ).toEqual({
      title: 'Barolo',
      shelf: 1,
      column: 3,
      drinkingWindowStart: 2018,
      drinkingWindowEnd: 2028,
      drinkingWindow: '2018 – 2028',
      drinkingWindowStatus: 'Drink now',
      position: '2:4',
    });
  });

  it('maps past peak and leaves unknown windows empty', () => {
    expect(
      wineForMcp({
        title: 'Rioja',
        shelf: 0,
        column: 0,
        drinkingWindowStatus: 6,
      })
    ).toMatchObject({
      position: '1:1',
      drinkingWindow: null,
      drinkingWindowStatus: 'Past its peak',
    });
  });
});
