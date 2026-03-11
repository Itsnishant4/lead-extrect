'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { AdminService } from '@/services/admin.service';
import { SiteConfigService } from '@/services/siteconfig.service';
import { updateBannerSchema } from '@/lib/validations';
import { handleActionError } from './helpers';

export async function getBannerAction() {
  try {
    const data = await SiteConfigService.getBanner();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateBannerAdminAction(data: {
  enabled: boolean;
  text: string;
  buttonText: string;
  buttonUrl: string;
  bgColor: string;
  countdownEnd?: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const validated = updateBannerSchema.parse(data);
    await SiteConfigService.setBanner(validated);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getSystemSettingsAction() {
  try {
    const maxRetries = await SiteConfigService.getMaxRetries();
    const leadQuality = await SiteConfigService.getLeadQualityThreshold();
    return { success: true, data: { maxRetries, leadQuality } };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateSystemSettingsAction(data: {
  maxRetries: number;
  leadQuality: number;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await SiteConfigService.setMaxRetries(data.maxRetries);
    await SiteConfigService.setLeadQualityThreshold(data.leadQuality);
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}
