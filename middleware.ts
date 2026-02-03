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

  // Paths reserved for unauthenticated users
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // If session is valid:
  if (isValidSession) {
    // Redirect authenticated users away from auth pages
    if (isAuthPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // If session is invalid/missing:
    // Redirect unauthenticated users to login, UNLESS they are on an auth page
    if (!isAuthPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
