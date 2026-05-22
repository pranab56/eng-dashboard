import { baseURL } from '@/utils/BaseURL';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('alexandertel-admin-token')?.value;
  const { pathname } = request.nextUrl;

  // Handle API proxies securely using HTTP-only cookie
  if (pathname.startsWith('/api/v1')) {
    const requestHeaders = new Headers(request.headers);
    if (token && !requestHeaders.has('Authorization')) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    const targetUrl = `${baseURL}${pathname}${request.nextUrl.search}`;
    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Define public routes (auth routes)
  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicFile = pathname.match(/\.(.*)$/) || pathname.startsWith('/_next');

  if (isPublicFile) {
    return NextResponse.next();
  }

  // If there's no token and it's not an auth route, redirect to login
  if (!token && !isAuthRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If there is a token and user is on an auth route, redirect to dashboard
  if (token && isAuthRoute) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

