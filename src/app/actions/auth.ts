'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(token: string, refreshToken?: string) {
  if (!token || typeof token !== 'string') return;
  const cookieStore = await cookies();
  cookieStore.set('alexandertel-admin-token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  if (refreshToken) {
    cookieStore.set('alexandertel-admin-refresh-token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('alexandertel-admin-token');
  cookieStore.delete('alexandertel-admin-refresh-token');
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('alexandertel-admin-token')?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get('alexandertel-admin-refresh-token')?.value;
}
