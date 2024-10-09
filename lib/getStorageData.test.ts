import mockWineList from '@/__fixtures__/MockWineList.json';
import { getStorageData } from './getStorageData';

describe('getStorageData', () => {
  it('gets correct average year', () => {
    const { averageYear } = getStorageData(mockWineList);

    expect(averageYear).toBe(2013);
  });

  it('gets correct average price', () => {
    const { averagePrice } = getStorageData(mockWineList);

    expect(averagePrice).toBe(5);
  });
});
