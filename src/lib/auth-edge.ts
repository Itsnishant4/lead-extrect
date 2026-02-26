import { SignJWT, jwtVerify } from 'jose';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be defined in production environment');
}
const SECRET_KEY = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signToken(payload: any): Promise<string> {
    return await new SignJWT(payload)
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
    } catch (error) {
        return null;
    }
}
