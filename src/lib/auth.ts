import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyToken } from './auth-edge';

export * from './auth-edge';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session) return null;
  return await verifyToken(session.value);
}
