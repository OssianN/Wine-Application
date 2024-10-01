'use server';
import WineDataBase from './wine-schema';
import { connectMongo } from './';
// import UserDataBase from './user-schema';
import { redirect } from 'next/navigation';

export const deleteWine = async (_id: string) => {
  let redirectPath = '/dashboard';

  try {
    await connectMongo();

    await Promise.all([
      WineDataBase.findOneAndDelete({ _id }),
      // UserDataBase.findOneAndDelete({ _id }); delete wine id
    ]);
  } catch (err) {
    console.log(err, 'wines / delete wine');
  } finally {
    if (redirectPath) redirect(redirectPath);
  }
};
