'use server';

import { getSession } from '@/lib/auth';
import { AdminService } from '@/services/admin.service';
import { PlanService } from '@/services/plan.service';
import { SubscriptionService } from '@/services/subscription.service';
import { createPlanSchema, updatePlanSchema } from '@/lib/validations';
import { handleActionError } from './helpers';

export async function getPlansAction() {
  try {
    const data = await PlanService.getAllPlans();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAllPlansAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await PlanService.getAllPlansAdmin();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createPlanAction(data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const validated = createPlanSchema.parse(data);
    const id = await PlanService.createPlan(validated);
    return { success: true, id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updatePlanAction(id: number, data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const validated = updatePlanSchema.parse(data);
    await PlanService.updatePlan(id, validated);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deletePlanAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await PlanService.deletePlan(id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function permanentDeletePlanAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await PlanService.permanentDeletePlan(id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createCheckoutSessionAction(planId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const result = await SubscriptionService.createOrder(session.id, planId);
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function checkOrderStatusAction(orderId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const status = await SubscriptionService.getOrderStatus(orderId);
    return { success: true, status };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getPaymentHistoryAction(cursor?: number, limit = 10) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await SubscriptionService.getPaymentHistory(session.id, cursor, limit);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getPaymentStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await SubscriptionService.getPaymentStats(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAllPaymentsAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await SubscriptionService.getAllPaymentsAdmin();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function acceptPaymentAdminAction(transactionId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await SubscriptionService.acceptPayment(transactionId);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function rejectPaymentAdminAction(transactionId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await SubscriptionService.rejectPayment(transactionId);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}
