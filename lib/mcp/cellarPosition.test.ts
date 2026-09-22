import {
  LIST_WINES_DESCRIPTION,
  cellarPositionLabel,
  wineForMcp,
} from './cellarPosition';

describe('cellarPositionLabel', () => {
  it('uses the same 1-based shelf:column numbers as the app', () => {
    expect(cellarPositionLabel(0, 0)).toBe('1:1');
    expect(cellarPositionLabel(2, 5)).toBe('3:6');
  });
});

describe('LIST_WINES_DESCRIPTION', () => {
  it('requires price, status, and position on every wine mention', () => {
    expect(LIST_WINES_DESCRIPTION).toMatch(/MUST include/);
    expect(LIST_WINES_DESCRIPTION).toMatch(/price/i);
    expect(LIST_WINES_DESCRIPTION).toMatch(/status/i);
    expect(LIST_WINES_DESCRIPTION).toMatch(/position/i);
    expect(LIST_WINES_DESCRIPTION).toMatch(/any other form/);
  });
});

describe('wineForMcp', () => {
  it('adds a copy-paste line with price, status, and position', () => {
    expect(
      wineForMcp({
        title: 'Barolo',
        shelf: 1,
        column: 3,
        price: 189,
        drinkingWindowStart: 2018,
        drinkingWindowEnd: 2028,
        drinkingWindowStatus: 5,
      })
    ).toEqual({
      title: 'Barolo',
      shelf: 1,
      column: 3,
      price: 189,
      drinkingWindowStart: 2018,
      drinkingWindowEnd: 2028,
      drinkingWindow: '2018 – 2028',
      drinkingWindowStatus: 'Drink now',
      status: 'Drink now',
      position: '2:4',
      requiredInEveryReply: 'price 189 kr, status Drink now, position 2:4',
    });
  });

  it('maps past peak and marks a missing price as unknown', () => {
    expect(
      wineForMcp({
        title: 'Rioja',
        shelf: 0,
        column: 0,
        drinkingWindowStatus: 6,
      })
    ).toMatchObject({
      price: null,
      position: '1:1',
      status: 'Past its peak',
      drinkingWindow: null,
      drinkingWindowStatus: 'Past its peak',
      requiredInEveryReply:
        'price unknown, status Past its peak, position 1:1',
    });
  });
});
