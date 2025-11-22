'use server';
import { getDbUser } from '@/mongoDB/getDbUser';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/types';

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

export const login = async (formData: FormData) => {
  const session = await getUserSession();
  const formEmail = formData.get('email') as string;
  const formPassword = formData.get('password') as string;

  const { user, error } = await getDbUser({
    email: formEmail,
    password: formPassword,
  });

  if (error) {
    return redirect(`/?error=${error}`);
  }

  if (!user) {
    return redirect('/?error=Invalid email or password');
  }

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
