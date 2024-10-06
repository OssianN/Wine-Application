'use server';
import UserDataBase from './user-schema';
import bcrypt from 'bcryptjs';
import { connectMongo } from './';
import { User } from '@/types';
import { getUserSession } from '@/lib/session';
import { registerFormSchema } from '@/lib/schemas';
import { redirect } from 'next/navigation';

type RegisterNewUserProps = {
  name: string;
  email: string;
  password: string;
};

export const registerNewUser = async (_: unknown, formData: FormData) => {
  const formName = formData.get('name') as string;
  const formEmail = formData.get('email') as string;
  const formPassword = formData.get('password') as string;
  const confirmPassword = formData.get('confirm') as string;

  const parse = registerFormSchema.safeParse({
    name: formName,
    email: formEmail,
    password: formPassword,
    confirm: confirmPassword,
  });

  if (!parse.success) {
    return { errors: parse.error.errors };
  }

  await connectMongo();

  const existingUser = await UserDataBase.findOne({
    email: formEmail.toLowerCase(),
  });

  if (existingUser) {
    return {
      errors: [
        { path: ['email'], message: 'Email already exists', code: 'custom' },
      ],
    };
  }

  const newUser: User = await new UserDataBase({
    name: formName,
    email: formEmail.toLowerCase(),
    password: await bcrypt.hash(formPassword, 10),
    wineList: [],
    shelves: 8,
    columns: 8,
  }).save();

  const session = await getUserSession();
  session.user = newUser;
  await session.save();

  redirect('/dashboard');
};
