'use server';
import {
  nonNullVivinoDetails,
  type VivinoDetailsFields,
  type WineVivinoDetailsUpdate,
} from '@/lib/vivinoDetails';
import WineDataBase from './wine-schema';
import { connectMongo } from '.';

export const updateVivinoDetailsInDb = async (
  wineId: string,
  details: VivinoDetailsFields
) => {
  const $set = nonNullVivinoDetails(details);
  if (Object.keys($set).length === 0) return;

  await connectMongo();
  await WineDataBase.findByIdAndUpdate(wineId, { $set }).exec();
};

export const bulkUpdateVivinoDetailsInDb = async (
  updates: WineVivinoDetailsUpdate[]
) => {
  const operations = updates
    .map(({ wineId, ...details }) => {
      const $set = nonNullVivinoDetails(details);
      if (Object.keys($set).length === 0) return null;
      return {
        updateOne: {
          filter: { _id: wineId },
          update: { $set },
        },
      };
    })
    .filter(
      (operation): operation is NonNullable<typeof operation> =>
        operation != null
    );

  if (operations.length === 0) return;

  await connectMongo();
  await WineDataBase.bulkWrite(operations);
};
