import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  let isValidSession = false;

  if (session) {
    const payload = await verifyToken(session.value);
    if (payload && payload.id) {
       // Check if account still exists in DB
       try {
         const user = await db.select({ id: users.id }).from(users).where(eq(users.id, Number(payload.id))).limit(1);
         if (user.length > 0) {
           isValidSession = true;
         }
       } catch (err) {
         console.error('[Middleware] DB Check error:', err);
         // If DB is down, we might want to still trust the JWT if it's signed? 
         // But "matching with any account" implies being strict.
         // However, high-availability usually favors trusting the JWT if DB is unreachable.
         // For now, let's stick to the user's request: must match an account.
       }
    }
  }

  const path = request.nextUrl.pathname;

  // 1. Guest-only paths: Logged-in users should NOT see these (redirect to /leads)
  const guestOnlyPaths = ['/login', '/signup', '/forgot-password'];
  const isGuestOnlyPath = guestOnlyPaths.some(p => path.startsWith(p));

  // 2. Public paths: Everyone can see these (no redirect)
  // Assets like favicon, robots, etc are also caught here if they are not excluded by matcher
  const publicPaths = [
    '/',
    '/pricing',
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

    let response;
    // Allow access to guest-only paths and public paths
    if (isGuestOnlyPath || isPublicPath) {
      response = NextResponse.next();
    } else {
      // Redirect everything else (protected routes) to /login
      response = NextResponse.redirect(new URL('/login', request.url));
    }

    // CRITICAL: If a session cookie exists but is invalid (e.g. account deleted, token expired),
    // remove it to prevent "ghost" sessions or flickering.
    if (session && !isValidSession) {
      response.cookies.delete('session');
    }

    return response;
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
