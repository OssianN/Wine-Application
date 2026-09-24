import { mock1, mock2 } from '@/__fixtures__/MockWineList.json';
import { getStorageData } from './getStorageData';

describe('getStorageData', () => {
  it('gets correct average year', () => {
    const { averageYear } = getStorageData(mock1, 8, 8);
    const { averageYear: averageYear2 } = getStorageData(mock2, 8, 8);

    expect(averageYear).toBe(2013);
    expect(averageYear2).toBe(1994);
  });

  it('gets correct average price', () => {
    const { averagePrice } = getStorageData(mock1, 8, 8);

    expect(averagePrice).toBe(5);
  });

  it('returns zero averages for an empty cellar', () => {
    const data = getStorageData([], 8, 8);

    expect(data.averageYear).toBe(0);
    expect(data.averagePrice).toBe(0);
    expect(data.costDifferencePercentage).toBe(0);
    expect(data.totalNumberOfBottles).toBe(0);
  });
});
