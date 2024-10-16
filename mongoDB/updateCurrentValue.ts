import WineDataBase from './wine-schema';

export const updateCurrentValueInDb = (
  wineId: string,
  currentValue: number
) => {
  WineDataBase.findByIdAndUpdate(wineId, {
    $set: { currentValue },
  });
};
