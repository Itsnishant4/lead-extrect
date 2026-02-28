import { db } from '@/lib/db';
import { plans } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export class PlanService {
  static async getAllPlans() {
    return await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.sortOrder));
  }

  static async getAllPlansAdmin() {
    return await db.select().from(plans).orderBy(asc(plans.sortOrder));
  }

  static async getPlanById(id: number) {
    const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return result[0];
  }

  static async createPlan(data: any) {
    const result = await db.insert(plans).values({
      name: data.name,
      description: data.description,
      price: data.price ?? 0,
      discount: data.discount ?? 0,
      period: data.period,
      leadsCredits: data.leadsCredits,
      features: data.features || [],
      unavailableFeatures: data.unavailableFeatures || [],
      whatsappUrl: data.whatsappUrl || null,
      badge: data.badge || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    }).returning({ id: plans.id });
    return result[0].id;
  }

  static async updatePlan(id: number, data: any) {
    const updateData: any = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.leadsCredits !== undefined) updateData.leadsCredits = data.leadsCredits;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.unavailableFeatures !== undefined) updateData.unavailableFeatures = data.unavailableFeatures;
    if (data.whatsappUrl !== undefined) updateData.whatsappUrl = data.whatsappUrl;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await db.update(plans).set(updateData).where(eq(plans.id, id));
  }

  static async deletePlan(id: number) {
    await db.update(plans).set({ isActive: false }).where(eq(plans.id, id));
  }
}
