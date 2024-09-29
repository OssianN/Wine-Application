'use server';
import bcrypt from 'bcryptjs';
import connectMongo from '.';
import UserDataBase from './user-schema';
import { User } from '@/types';

type getDbUserProps = {
  email: User['email'];
  password: User['password'];
};

export const getDbUser = async ({ email, password }: getDbUserProps) => {
  await connectMongo();
  const user = await UserDataBase.findOne<User>({
    email: email.toLowerCase(),
  });

  if (!user) {
    return { error: 'Wrong credentials.' };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return { error: 'Wrong credentials.' };
  }

  return { user };
};
