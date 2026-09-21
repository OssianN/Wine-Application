'use server';
import { getDbUser } from '@/mongoDB/getDbUser';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginFormSchema } from '@/lib/schemas';
import type { User } from '@/types';
import type { ZodIssue } from 'zod';

export type LoginActionState = {
  errors?: ZodIssue[];
  error?: string;
};

type SessionData = {
  user?: Omit<User, 'wineList' | 'password'>;
  isLoggedId: boolean;
};

const sessionOptions = {
  cookieName: 'userSession',
  password: process.env.SECRET_COOKIE_PASSWORD ?? '',
  ttl: 0,

  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export const getUserSession = async () => {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  return session;
};

export const login = async (
  _: unknown,
  formData: FormData
): Promise<LoginActionState> => {
  const parse = loginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parse.success) {
    return { errors: parse.error.errors };
  }

  const { user, error } = await getDbUser({
    email: parse.data.email,
    password: parse.data.password,
  });

  if (error) {
    return { error };
  }

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const session = await getUserSession();
  session.user = {
    name: user.name,
    email: user.email,
    _id: user._id,
    shelves: user.shelves,
    columns: user.columns,
  };
  session.isLoggedId = true;

  await session.save();
  redirect('/dashboard');
};

export const logout = async () => {
  const session = await getUserSession();
  session.destroy();
  redirect('/');
};
