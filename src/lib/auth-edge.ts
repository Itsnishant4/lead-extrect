import { SignJWT, jwtVerify } from 'jose';

const isDev = process.env.NODE_ENV === 'development';

// Require JWT_SECRET in production, throw error
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  if (isDev) {
    console.warn('[AUTH] WARNING: JWT_SECRET not set. Using dev-only fallback. NOT FOR PRODUCTION!');
  } else {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
}

// Use dev fallback only in development
const key = new TextEncoder().encode(SECRET_KEY || 'dev-fallback-key-not-secure-for-production');

export async function signToken(payload: { id: number; email: string; name: string; is_admin?: boolean }): Promise<string> {
    if (!payload.id || !payload.email) {
        throw new Error('Token payload must include id and email');
    }
    return await new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days session
        .sign(key);
}

export async function verifyToken(token: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error: any) {
        console.error('[Auth-Edge] Token verification failed:', error.message);
        return null;
    }
}
