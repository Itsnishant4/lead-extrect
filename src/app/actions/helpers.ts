'use server';

import { headers } from 'next/headers';
import { fromZodError } from 'zod-validation-error';
import { AuditService } from '@/services/audit.service';
import { getSession } from '@/lib/auth';

export async function getClientInfo() {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const userAgent = headerList.get('user-agent');
  const acceptLanguage = headerList.get('accept-language');
  return { ip, userAgent, acceptLanguage };
}

export async function handleActionError(error: any) {
  if (error.name === 'ZodError') {
    return { success: false, error: fromZodError(error).message };
  }
  return { success: false, error: error.message || 'Something went wrong' };
}

export async function logAction(action: string, status: 'success' | 'error' | 'info', metadata: any = {}) {
  const session = await getSession();
  if (!session) return;
  return await AuditService.logAction(action, status, metadata);
}
