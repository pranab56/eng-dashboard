'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('alexandertel-admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('alexandertel-admin-token');
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('alexandertel-admin-token')?.value;
}
