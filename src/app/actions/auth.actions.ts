'use server';

import { getSession } from '@/lib/auth';
import { memoryCheckRateLimit as checkRateLimit } from '@/lib/security/memory-ratelimit';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { signupSchema, loginSchema, otpSchema, resetPasswordSchema } from '@/lib/validations';
import { getClientInfo, handleActionError } from './helpers';
import { withCache } from '@/lib/cache';

export async function signupAction(name: string, email: string, password: string) {
  try {
    signupSchema.parse({ name, email, password });
    const { ip } = await getClientInfo();
    if (!(await checkRateLimit(`signup:ip:${ip}`, 5, 60000))) {
      return { success: false, error: 'Too many signup attempts. Try again later.' };
    }
    await AuthService.signup(name, email, password, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function loginAction(email: string, password: string) {
  try {
    loginSchema.parse({ email, password });
    const { ip } = await getClientInfo();
    if (!(await checkRateLimit(`login:ip:${ip}`, 10, 60000))) {
      return { success: false, error: 'Too many login attempts. Try again later.' };
    }
    await AuthService.login(email, password, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function logoutAction() {
  await AuthService.logout();
  return { success: true };
}

export async function googleLoginAction(email: string, name: string) {
  try {
    const { ip } = await getClientInfo();
    await AuthService.googleLogin(email, name, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function requestOTPAction(email: string) {
  try {
    const { ip } = await getClientInfo();
    if (!(await checkRateLimit(`otp:ip:${ip}`, 3, 60000))) {
      return { success: false, error: 'Too many OTP requests. Please wait a minute.' };
    }
    await AuthService.requestOTP(email, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function verifyOTPAction(email: string, otp: string) {
  try {
    otpSchema.parse({ email, otp });
    const { ip } = await getClientInfo();
    if (!(await checkRateLimit(`verify_otp:ip:${ip}`, 10, 60000))) {
      return { success: false, error: 'Too many verification attempts. Try again later.' };
    }
    await AuthService.verifyOTP(email, otp, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function resetPasswordAction(email: string, otp: string, newPassword: string) {
  try {
    resetPasswordSchema.parse({ email, otp, newPassword });
    const { ip } = await getClientInfo();
    await AuthService.resetPassword(email, otp, newPassword, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getUserAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const user = await UserService.getUser(session.id);
    return { success: true, data: user };
  } catch (e) {
    return { success: false, data: null };
  }
}

export async function getDashboardStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    // Cache for 25 seconds per user
    const data = await withCache(`user-dashboard-stats-${session.id}`, () => UserService.getDashboardStats(session.id), 25000);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}
