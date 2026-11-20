import { headers } from 'next/headers';
import { cache } from 'react';
import { auth } from './config';

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const requireSession = async () => {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
};