import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  let isValidSession = false;

  if (session) {
    console.log(`[Middleware] Session cookie found: ${session.value.substring(0, 10)}...`);
    const payload = await verifyToken(session.value);
    if (payload) {
      console.log("[Middleware] Session is VALID");
      isValidSession = true;
    } else {
      console.log("[Middleware] Session is INVALID (verifyToken returned null)");
    }
  } else {
    console.log("[Middleware] No session cookie found");
  }

  const path = request.nextUrl.pathname;

  // 1. Guest-only paths: Logged-in users should NOT see these (redirect to /leads)
  const guestOnlyPaths = ['/login', '/signup', '/forgot-password'];
  const isGuestOnlyPath = guestOnlyPaths.some(p => path.startsWith(p));

  // 2. Public paths: Everyone can see these (no redirect)
  // Assets like favicon, robots, etc are also caught here if they are not excluded by matcher
  const publicPaths = [
    '/',
    '/company',
    '/privacy',
    '/terms',
    '/features',
    '/use-cases',
    '/blog',
    '/robots.txt',
    '/sitemap',
    '/googleb9ce8135773393a8.html'
  ];
  
  // Public prefix paths where anything starting with this is allowed
  const isPublicPrefix = [
    '/blog/', 
    '/features/', 
    '/leads/', 
    '/compare/', 
    '/sitemap/',
    '/sitemap.xml',
    '/favicon/'
  ];
  
  const isPublicPath = publicPaths.includes(path) || isPublicPrefix.some(p => path.startsWith(p));

  // LOGIC:

  if (isValidSession) {
    // If user is logged in:

    // Redirect away from guest-only paths (login/signup)
    if (isGuestOnlyPath) {
      return NextResponse.redirect(new URL('/leads', request.url));
    }

    // Otherwise, allow access (dashboard, public pages like privacy, robots, etc)
    return NextResponse.next();
  } else {
    // If user is NOT logged in:

    // Allow access to guest-only paths and public paths
    if (isGuestOnlyPath || isPublicPath) {
      return NextResponse.next();
    }

    // Redirect everything else (protected routes) to /login
    return NextResponse.redirect(new URL('/login', request.url));
  }
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|webmanifest)|favicon.ico).*)',
  ],
};
