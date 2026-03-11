'use server';

import { getSession } from '@/lib/auth';
import { SettingsService } from '@/services/settings.service';
import { ProxyService } from '@/services/proxy.service';
import { addProxySchema, updateSettingSchema } from '@/lib/validations';
import { handleActionError } from './helpers';

export async function getSettingsAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await SettingsService.getSettings(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateSettingAction(key: string, value: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    updateSettingSchema.parse({ key, value });
    await SettingsService.updateSetting(session.id, key, value);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getProxiesAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await ProxyService.getProxies(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function addProxyAction(proxy: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const validated = addProxySchema.parse(proxy);
    await ProxyService.addProxy(session.id, validated);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deleteProxyAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await ProxyService.deleteProxy(session.id, id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function toggleProxyAction(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await ProxyService.toggleProxy(session.id, id, isActive);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}
export async function updateLeadQualityAction(threshold: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const { UserService } = await import('@/services/user.service');
    await UserService.updateLeadQualityThreshold(session.id, threshold);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}
