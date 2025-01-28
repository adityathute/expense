// middleware.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token');

  // Define which routes to apply the middleware on
  const url = request.nextUrl.pathname;

  if (url.startsWith('/dashboard')) {
    if (accessToken) {
      console.log('Access Token:', accessToken);
    } else {
      console.log('No access token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url)); // Redirect if token is missing
    }
  }

  return NextResponse.next();
}
