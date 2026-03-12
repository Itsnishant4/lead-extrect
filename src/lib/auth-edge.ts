import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET ?? (() => {
  throw new Error('JWT_SECRET environment variable is required');
})();

const key = new TextEncoder().encode(SECRET_KEY);

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
