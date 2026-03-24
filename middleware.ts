import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

// In-memory cache for user validation (reset on deployment)
// Map<userId, timestamp when validated>
const userValidationCache = new Map<number, number>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes - balance between performance and security

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  let isValidSession = false;

  if (session) {
    const payload = await verifyToken(session.value);
    if (payload && payload.id) {
      const userId = Number(payload.id);
      
      // Check cache first
      const cachedTime = userValidationCache.get(userId);
      const now = Date.now();
      
      if (cachedTime && (now - cachedTime) < CACHE_TTL_MS) {
        // Cache hit - trust the JWT without DB call
        isValidSession = true;
      } else {
        // Cache miss or expired - verify with DB
        try {
          const { db } = await import('@/lib/db/index');
          const { users } = await import('@/lib/db/schema');
          const { eq } = await import('drizzle-orm');
          
          const user = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
          if (user.length > 0) {
            isValidSession = true;
            // Update cache
            userValidationCache.set(userId, now);
          } else {
            // User no longer exists - clear cache
            userValidationCache.delete(userId);
          }
        } catch (err) {
          console.error('[Middleware] DB Check error:', err);
          // If DB is down, trust the JWT if it's valid (high availability)
          isValidSession = true;
        }
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
    '/alternatives/',
    '/industries/',
    '/sitemap/',
    '/sitemap.xml',
    '/favicon',
    '/favicon.ico'
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
     * - favicon, images, and other static assets
     */
    '/((?!api|_next/static|_next/image|favicon|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|webmanifest|woff|woff2)).*)',
  ],
};
