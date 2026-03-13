'use server';

import { getSession } from '@/lib/auth';
import { SettingsService } from '@/services/settings.service';
import { ProxyService } from '@/services/proxy.service';
import { AdminService } from '@/services/admin.service';
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

export async function getAllProxiesAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await ProxyService.getAllProxies();
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

export async function addProxyAdminAction(proxy: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const validated = addProxySchema.parse(proxy);
    await ProxyService.addProxy(null, validated);
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

export async function deleteProxyAdminAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await ProxyService.deleteProxy(null, id);
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

export async function toggleProxyAdminAction(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await ProxyService.toggleProxy(null, id, isActive);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function bulkAddProxiesAdminAction(proxies: any[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    if (!Array.isArray(proxies) || proxies.length === 0) {
      return { success: false, error: 'Invalid proxies array' };
    }
    let addedCount = 0;
    for (const proxy of proxies) {
      if (proxy.host && proxy.port) {
        await ProxyService.addProxy(null, {
          host: proxy.host,
          port: proxy.port,
          username: proxy.username || null,
          password: proxy.password || null,
          protocol: proxy.protocol || 'http',
          is_active: proxy.is_active !== undefined ? Boolean(proxy.is_active) : true,
        });
        addedCount++;
      }
    }
    return { success: true, count: addedCount };
  } catch (error: any) {
    return handleActionError(error);
  }
}
