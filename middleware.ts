import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  let isValidSession = false;

  if (session) {
    try {
      await jwtVerify(session.value, key, { algorithms: ['HS256'] });
      isValidSession = true;
    } catch (error) {
      // Invalid token
    }
  }

  // Paths reserved for unauthenticated users (login/signup)
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Paths accessible to public (unauthenticated users)
  const isPublicPath = request.nextUrl.pathname === '/';

  // If session is valid:
  if (isValidSession) {
    // Redirect authenticated users away from auth pages to /leads
    if (isAuthPath) {
      return NextResponse.redirect(new URL('/leads', request.url));
    }
    // Redirect authenticated users from landing page to /leads
    if (isPublicPath) {
      return NextResponse.redirect(new URL('/leads', request.url));
    }
  } else {
    // If session is invalid/missing:
    // Redirect unauthenticated users to login, UNLESS they are on an auth page OR the landing page
    if (!isAuthPath && !isPublicPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .png, .jpg, .jpeg, .svg, .gif, .webp (common image extensions)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)|favicon.ico).*)',
  ],
};
