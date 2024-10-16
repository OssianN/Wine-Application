'use server';
import WineDataBase from './wine-schema';

export const updateCurrentValueInDb = async (
  wineId: string,
  currentValue: number
) => {
  return await WineDataBase.findByIdAndUpdate(wineId, {
    currentValue,
  });
};
