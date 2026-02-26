import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class UserRepository {
  static async findById(id: number, tx: any = db) {
    const result = await tx.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  static async findByEmail(email: string, tx: any = db) {
    const result = await tx.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  static async update(id: number, data: Partial<typeof users.$inferInsert> | any, tx: any = db) {
    await tx.update(users).set(data).where(eq(users.id, id));
  }
}
