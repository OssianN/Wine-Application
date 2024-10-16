import mockWineList from '@/__fixtures__/MockWineList.json';
import { getStorageData } from './getStorageData';

describe('getStorageData', () => {
  it('gets correct average year', () => {
    const { averageYear } = getStorageData(mockWineList, 8, 8);

    expect(averageYear).toBe(2013);
  });

  it('gets correct average price', () => {
    const { averagePrice } = getStorageData(mockWineList, 8, 8);

    expect(averagePrice).toBe(5);
  });
});
