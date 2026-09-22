'use server';
import { findUserWines } from './findUserWines';
import type { Wine } from '@/types';

type GetUserWineProps = {
  _id: string;
  isArchived?: boolean;
};

export const getUserWine = async ({
  _id,
  isArchived,
}: GetUserWineProps): Promise<Wine[]> => {
  const list = await findUserWines(_id);

  return list.filter(wine => !!wine.archived === !!isArchived);
};
