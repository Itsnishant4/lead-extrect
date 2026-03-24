import { db } from '@/lib/db/index';
import { users, plans } from '@/lib/db/schema';
import { eq, sql, and, or, desc } from 'drizzle-orm';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { AuditService } from './audit.service';
import { memoryCheckRateLimit as checkRateLimit } from '@/lib/security/memory-ratelimit';
import { UserRepository } from '@/repositories/user.repository';
import { maskError, AppError } from '@/lib/utils/error.utils';
import { getGeoLocation, getClientIp } from '@/lib/geo';

export class AuthService {
  static async signup(name: string, email: string, password: string, ip?: string) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const freePlan = await db.select({ leadsCredits: plans.leadsCredits })
      .from(plans)
      .where(and(
        or(
          eq(plans.period, 'free'),
          sql`LOWER(${plans.name}) LIKE LOWER('%free%')`,
        ),
        eq(plans.isActive, true)
      ))
      .orderBy(desc(plans.leadsCredits))
      .limit(1)
      .then(r => r[0]);
      
    const initialCredits = freePlan?.leadsCredits || 0;

    const geo = ip ? await getGeoLocation(ip) : null;

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      bonusCredits: initialCredits,
      country: geo?.country,
      city: geo?.city,
      latitude: geo?.latitude,
      longitude: geo?.longitude,
      lastActive: new Date(),
    });

    const newUser = await UserRepository.findByEmail(email);
    if (!newUser) {
      throw new Error('Failed to retrieve user after creation');
    }

    const userId = newUser.id;
    const token = await signToken({ id: userId, email, name });

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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

    const geo = ip ? await getGeoLocation(ip) : null;
    
    await db.update(users).set({
      lastActive: new Date(),
      ...(geo && {
        country: geo.country,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
      }),
    }).where(eq(users.id, user.id));

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    await AuditService.logAction('login', 'success', { email, ip });
    const { password: _p, otpCode: _o, ...safeUser } = user;
    return safeUser;
  }

  static async logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
  }

  static async googleLogin(googleEmail: string, googleName: string, ip?: string) {
    let user = await UserRepository.findByEmail(googleEmail);

    if (!user) {
      // Create new user via Google
      const freePlan = await db.select({ leadsCredits: plans.leadsCredits })
        .from(plans)
        .where(and(
          or(
            eq(plans.period, 'free'),
            sql`LOWER(${plans.name}) LIKE LOWER('%free%')`
          ),
          eq(plans.isActive, true)
        ))
        .orderBy(desc(plans.leadsCredits))
        .limit(1)
        .then(r => r[0]);

      const initialCredits = freePlan?.leadsCredits || 50;
      const geo = ip ? await getGeoLocation(ip) : null;

      // Generate random password for Google users
      const tempPassword = randomBytes(32).toString('hex');
      const hashedPassword = await hashPassword(tempPassword);

      await db.insert(users).values({
        name: googleName || googleEmail.split('@')[0],
        email: googleEmail,
        password: hashedPassword,
        bonusCredits: initialCredits,
        country: geo?.country,
        city: geo?.city,
        latitude: geo?.latitude,
        longitude: geo?.longitude,
        lastActive: new Date(),
      });

      user = await UserRepository.findByEmail(googleEmail);
    }

    if (!user) {
      throw new Error('Failed to create or find user');
    }

    if (user.isSuspended) {
      throw new Error('Account suspended. Contact support.');
    }

    const token = await signToken({ id: user.id, email: user.email, name: user.name });
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    await AuditService.logAction('google_login', 'success', { email: googleEmail, ip });
    return { id: user.id, email: user.email, name: user.name };
  }

  static async requestOTP(email: string, ip: string) {
    try {
      if (!(await checkRateLimit(`otp:email:${email}`, 3, 60000, true))) {
        throw new Error('Too many OTP requests for this account.');
      }

      const { generateOTP, sendOTPEmail } = await import('@/lib/mailer');

      // db.transaction is currently failing on the sqlhost proxy.
      // We use sequential updates. This is safe for OTP request.
      const userRows = await db.select().from(users).where(eq(users.email, email));
      const user = userRows[0];
      if (!user) throw new Error("You are not registered");

      if (user.isSuspended) {
        throw new Error('Account suspended. Contact support.');
      }

      const otp = generateOTP();

      await UserRepository.update(user.id, {
        otpCode: otp,
        otpExpiry: sql`datetime('now', '+10 minutes')`,
        otpAttempts: 0,
      });

      const sent = await sendOTPEmail(email, otp);
      if (!sent) {
        throw new Error('Failed to send OTP email. Please try again.');
      }

      await AuditService.logAction('request_otp', 'success', { email, ip });
      return true;
    } catch (err) {
      console.error('[AUTH SERVICE] requestOTP error:', err);
      throw new Error(maskError(err));
    }
  }

  static async verifyOTP(email: string, otp: string, ip: string): Promise<number> {
    try {
      if (!(await checkRateLimit(`verify:email:${email}`, 5, 60000, true))) {
        throw new Error('Too many verification attempts. Please wait a minute.');
      }

      // Sequential verification to avoid db.transaction issues with LibSQL proxy
      const userRows = await db.select().from(users).where(eq(users.email, email));
      const user = userRows[0];

      if (!user) {
        throw new Error('Invalid email or OTP.');
      }

      if (!user.otpCode || !user.otpExpiry) {
        throw new Error('No OTP requested. Please request a new one.');
      }

      const isExpired = new Date(user.otpExpiry) < new Date();
      if (isExpired) {
        await db.update(users).set({ otpCode: null, otpExpiry: null, otpAttempts: 0 }).where(eq(users.id, user.id));
        throw new Error('OTP has expired. Please request a new one.');
      }

      if ((user.otpAttempts || 0) >= 5) {
        await db.update(users).set({ otpCode: null, otpExpiry: null, otpAttempts: 0 }).where(eq(users.id, user.id));
        throw new Error('Too many failed attempts. Please request a new OTP.');
      }

      if (user.otpCode !== otp) {
        await db.update(users).set({ otpAttempts: sql`otp_attempts + 1` }).where(eq(users.id, user.id));
        await AuditService.logAction('verify_otp', 'error', { email, reason: 'Invalid OTP', ip });
        throw new Error('Invalid OTP. Please try again.');
      }

      await AuditService.logAction('verify_otp', 'success', { email, ip });
      return user.id;
    } catch (err) {
      console.error('[AUTH SERVICE] verifyOTP error:', err);
      throw new Error(maskError(err));
    }
  }

  static async resetPassword(email: string, otp: string, newPassword: string, ip: string) {
    try {
      const userId = await this.verifyOTP(email, otp, ip);

      const hashedPassword = await hashPassword(newPassword);

      await UserRepository.update(userId, {
        password: hashedPassword,
        otpCode: null, // CRITICAL FIX: Wipe OTP after successful password reset
        otpExpiry: null,
        otpAttempts: 0,
      });

      await AuditService.logAction('reset_password', 'success', { email, ip });
      return true;
    } catch (err) {
      console.error('[AUTH SERVICE] resetPassword error:', err);
      throw new Error(maskError(err));
    }
  }
}
