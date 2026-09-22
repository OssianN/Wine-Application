import { connectMongo } from './';
import UserDataBase from './user-schema';

export const findUserIdByEmail = async (email: string) => {
  await connectMongo();
  const user = await UserDataBase.findOne({
    email: email.toLowerCase(),
  }).lean();

  if (!user?._id) {
    return null;
  }

  return String(user._id);
};
