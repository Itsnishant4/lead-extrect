'use server';

import { getSession } from '@/lib/auth';
import { ListService } from '@/services/list.service';
import { handleActionError } from './helpers';

export async function getSavedListsAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await ListService.getSavedLists(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getSavedListLeadsAction(listId: number) {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await ListService.getSavedListLeads(session.id, listId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getExportTemplatesAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await ListService.getExportTemplates(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createExportTemplateAction(name: string, columns: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const id = await ListService.createExportTemplate(session.id, name, columns);
    return { success: true, templateId: id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createSavedListAction(name: string, leadIds: number[], description?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const id = await ListService.createSavedList(session.id, name, leadIds, description);
    return { success: true, listId: id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createSavedListFromLeadsAction(name: string, leads: any[], description?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const leadIds = leads.map((l: any) => l.id).filter((id: any): id is number => typeof id === 'number');
    const id = await ListService.createSavedList(session.id, name, leadIds, description);
    return { success: true, listId: id };
  } catch (error: any) {
    return handleActionError(error);
  }
}
