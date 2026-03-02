import { db } from '@/lib/db/index';
import { users, plans } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { AuditService } from './audit.service';
import { checkRateLimit } from '@/lib/security/ratelimit';
import { UserRepository } from '@/repositories/user.repository';

export class AuthService {
  static async signup(name: string, email: string, password: string) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    // Look up the free plan from DB to get initial credits
    const freePlan = await db.select({ leadsCredits: plans.leadsCredits })
      .from(plans)
      .where(and(eq(plans.name, 'Free'), eq(plans.isActive, true)))
      .limit(1)
      .then(r => r[0]);

    const initialCredits = freePlan?.leadsCredits || 0;

    const result = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      bonusCredits: initialCredits,
    }).returning({ id: users.id });

    const userId = result[0].id;
    const token = await signToken({ id: userId, email, name });

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    await AuditService.logAction('signup', 'success', { email });
    return { id: userId, email, name };
  }

  static async login(email: string, password: string, ip: string) {
    if (!(await checkRateLimit(`login:email:${email}`, 5, 60000, true))) {
      throw new Error('Too many login attempts for this account. Try again in a minute.');
    }

    const user = await UserRepository.findByEmail(email);

    if (!user || !(await verifyPassword(password, user.password))) {
      await AuditService.logAction('login', 'error', { email, reason: 'Invalid credentials', ip });
      throw new Error('Invalid credentials');
    }
    if (user.isSuspended) {
      throw new Error('Account suspended. Contact support.');
    }

    const token = await signToken({ id: user.id, email: user.email, name: user.name });

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    await AuditService.logAction('login', 'success', { email, ip });
    return user;
  }

  static async logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
  }

  static async requestOTP(email: string, ip: string) {
    if (!(await checkRateLimit(`otp:email:${email}`, 3, 60000, true))) {
      throw new Error('Too many OTP requests for this account.');
    }

    const { generateOTP, sendOTPEmail } = await import('@/lib/mailer');

    return await db.transaction(async (tx) => {
      const userRows = await tx.select().from(users).where(eq(users.email, email)).for('update');
      const user = userRows[0];
      if (!user) throw new Error("You are not registered");

      if (user.isSuspended) {
        throw new Error('Account suspended. Contact support.');
      }

      const otp = generateOTP();

      await UserRepository.update(user.id, {
        otpCode: otp,
        otpExpiry: sql`NOW() + INTERVAL '10 minutes'`,
        otpAttempts: 0,
      }, tx);

      const sent = await sendOTPEmail(email, otp);
      if (!sent) {
        throw new Error('Failed to send OTP email. Please try again.');
      }

      await AuditService.logAction('request_otp', 'success', { email, ip });
      return true;
    });
  }

  static async verifyOTP(email: string, otp: string, ip: string): Promise<number> {
    if (!(await checkRateLimit(`verify:email:${email}`, 5, 60000, true))) {
      throw new Error('Too many verification attempts. Please wait a minute.');
    }

    return await db.transaction(async (tx) => {
      const userRows = await tx.select().from(users).where(eq(users.email, email)).for('update');
      const user = userRows[0];

      if (!user) {
        throw new Error('Invalid email or OTP.');
      }

      if (!user.otpCode || !user.otpExpiry) {
        throw new Error('No OTP requested. Please request a new one.');
      }

      const isExpired = new Date(user.otpExpiry) < new Date();
      if (isExpired) {
        await tx.update(users).set({ otpCode: null, otpExpiry: null, otpAttempts: 0 }).where(eq(users.id, user.id));
        throw new Error('OTP has expired. Please request a new one.');
      }

      if ((user.otpAttempts || 0) >= 5) {
        await tx.update(users).set({ otpCode: null, otpExpiry: null, otpAttempts: 0 }).where(eq(users.id, user.id));
        throw new Error('Too many failed attempts. Please request a new OTP.');
      }

      if (user.otpCode !== otp) {
        await tx.update(users).set({ otpAttempts: sql`otp_attempts + 1` }).where(eq(users.id, user.id));
        await AuditService.logAction('verify_otp', 'error', { email, reason: 'Invalid OTP', ip });
        throw new Error('Invalid OTP. Please try again.');
      }

      // Success: Wipe OTP
      await tx.update(users).set({ otpCode: null, otpExpiry: null, otpAttempts: 0 }).where(eq(users.id, user.id));
      
      await AuditService.logAction('verify_otp', 'success', { email, ip });
      return user.id;
    });
  }

  static async resetPassword(email: string, otp: string, newPassword: string, ip: string) {
    const userId = await this.verifyOTP(email, otp, ip);

    const hashedPassword = await hashPassword(newPassword);

    await UserRepository.update(userId, {
      password: hashedPassword,
    });
    
    await AuditService.logAction('reset_password', 'success', { email, ip });
    return true;
  }
}
