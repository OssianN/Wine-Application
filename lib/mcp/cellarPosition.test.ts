import { cellarPositionLabel, withCellarPosition } from './cellarPosition';

describe('cellarPositionLabel', () => {
  it('uses the same 1-based shelf:column numbers as the app', () => {
    expect(cellarPositionLabel(0, 0)).toBe('1:1');
    expect(cellarPositionLabel(2, 5)).toBe('3:6');
  });
});

describe('withCellarPosition', () => {
  it('adds position without changing the stored shelf and column', () => {
    expect(
      withCellarPosition({ title: 'Barolo', shelf: 1, column: 3 })
    ).toEqual({
      title: 'Barolo',
      shelf: 1,
      column: 3,
      position: '2:4',
    });
  });
});
