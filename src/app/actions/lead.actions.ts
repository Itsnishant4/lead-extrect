'use server';

import { getSession } from '@/lib/auth';
import { LeadService } from '@/services/lead.service';
import { handleActionError } from './helpers';

export async function getLeadsAction(searchId?: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await LeadService.getLeads(session.id, searchId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function wipeAllLeadsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await LeadService.wipeLeadsForUser(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}
