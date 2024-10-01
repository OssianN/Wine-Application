'use server';
import UserDataBase from './user-schema';
import bcrypt from 'bcryptjs';
import { connectMongo } from './';
import { User } from '@/types';
import { getUserSession } from '@/lib/session';

type RegisterNewUserProps = {
  name: string;
  email: string;
  password: string;
};

export const RegisterNewUser = async ({
  name,
  email,
  password,
}: RegisterNewUserProps) => {
  await connectMongo();

  const existingUser = await UserDataBase.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    return { error: { email: 'Email already exists' } };
  }

  const newUser: User = await new UserDataBase({
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    wineList: [],
  }).save();

  const session = await getUserSession();
  session.user = newUser;
  await session.save();
};
