import { db } from '@/lib/db';
import { transactions, users, plans } from '@/lib/db/schema';
import { eq, sql, desc, ne, lt, count } from 'drizzle-orm';
import crypto from 'crypto';
import { NotificationService } from './notification.service';

export class SubscriptionService {
  private static computeExpiry(period: string | null): Date | null {
    if (!period) return null;
    const lower = period.toLowerCase();
    if (lower === 'month' || lower === 'monthly') {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    if (lower === 'year' || lower === 'yearly' || lower === 'annual') {
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    if (lower === 'lifetime') {
      return new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // ~100 years
    }
    // Default: 30 days for unknown periods
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  static async createOrder(userId: number, planId: number) {
    const plan = await db.select().from(plans).where(eq(plans.id, planId)).limit(1).then(res => res[0]);
    if (!plan) throw new Error('Plan not found');

    const result = await db.insert(transactions).values({
      userId,
      planId,
      amount: plan.price.toString(),
      status: 'pending',
    }).returning({ id: transactions.id });

    const transactionId = result?.[0]?.id ?? (await db.select({ id: transactions.id }).from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.id)).limit(1))[0]?.id;

    const orderId = `ORD-${transactionId}-${Date.now()}`;
    
    // Call AutoPay API
    const response = await fetch('https://ptm-phi.vercel.app/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.AUTOPAY_API_KEY || '',
      },
      body: JSON.stringify({
        amount: plan.price.toString(),
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/autopay`,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        order_id: orderId,
      }),
    });

    const gatewayResult = await response.json();
    if (!gatewayResult.success) {
      throw new Error(gatewayResult.error || 'Failed to create order with gateway');
    }

    // Update transaction with gateway order ID and exact amount
    await db.update(transactions).set({
      gatewayOrderId: orderId,
      amount: gatewayResult.data.amount, // Use the fractional amount from gateway
    }).where(eq(transactions.id, transactionId));

    return {
      paymentUrl: gatewayResult.data.payment_url,
      orderId: orderId,
    };
  }

  static async verifyWebhook(body: any, signature: string) {
    const expectedSignature = crypto.createHmac('sha256', process.env.AUTOPAY_API_KEY || '')
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }

  static async getOrderStatus(orderId: string) {
    const tx = await db.select({ status: transactions.status }).from(transactions).where(eq(transactions.gatewayOrderId, orderId)).limit(1).then(r => r[0]);
    return tx?.status || null;
  }

  static async handleSuccessfulPayment(data: any) {
    const { order_id, amount, utr } = data;

    await db.transaction(async (tx) => {
      const transactionRows = await tx.select().from(transactions).where(eq(transactions.gatewayOrderId, order_id)).limit(1);
      const transaction = transactionRows[0];
      
      if (!transaction) throw new Error('Transaction not found');
      if (transaction.status === 'paid') return; // Already processed

      const planRows = await tx.select().from(plans).where(eq(plans.id, transaction.planId!)).limit(1);
      const plan = planRows[0];
      if (!plan) throw new Error('Plan not found');

      // Update transaction
      await tx.update(transactions).set({
        status: 'paid',
        utr: utr,
        updatedAt: new Date(),
      }).where(eq(transactions.id, transaction.id));

      // Update user credits and plan
      await tx.update(users).set({
        planType: plan.name.toLowerCase(),
        bonusCredits: sql`COALESCE(${users.bonusCredits}, 0) + ${plan.leadsCredits}`,
        subscriptionExpiry: SubscriptionService.computeExpiry(plan.period),
      }).where(eq(users.id, transaction.userId!));

      // Notify user of successful payment (fire-and-forget, outside transaction)
      const uid = transaction.userId!;
      const pName = plan.name;
      const pAmount = amount || transaction.amount;
      setTimeout(() => {
        void NotificationService.notifyPaymentSuccess(uid, pName, String(pAmount));
      }, 0);
    });
  }

  static async getPaymentHistory(userId: number, cursor?: number, limit = 10) {
    const baseWhere = cursor
      ? sql`${transactions.userId} = ${userId} AND ${transactions.id} < ${cursor}`
      : eq(transactions.userId, userId);

    const rows = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        status: transactions.status,
        gatewayOrderId: transactions.gatewayOrderId,
        utr: transactions.utr,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        planName: plans.name,
        planPeriod: plans.period,
        planCredits: plans.leadsCredits,
      })
      .from(transactions)
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .where(baseWhere)
      .orderBy(desc(transactions.id))
      .limit(limit + 1); // Fetch one extra to check if there are more

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return { items, nextCursor };
  }

  static async getPaymentStats(userId: number) {
    const [stats] = await db
      .select({
        totalAttempts: count(),
        totalPaid: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'paid' THEN CAST(${transactions.amount} AS REAL) ELSE 0 END), 0)`,
        successCount: sql<number>`COUNT(CASE WHEN ${transactions.status} = 'paid' THEN 1 END)`,
        failedCount: sql<number>`COUNT(CASE WHEN ${transactions.status} != 'paid' THEN 1 END)`,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    return {
      totalAttempts: stats.totalAttempts,
      totalPaid: parseFloat(stats.totalPaid || '0'),
      successCount: stats.successCount,
      failedCount: stats.failedCount,
    };
  }

  static async getAllPaymentsAdmin() {
    return await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        status: transactions.status,
        gatewayOrderId: transactions.gatewayOrderId,
        utr: transactions.utr,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        userId: transactions.userId,
        planId: transactions.planId,
        userName: users.name,
        userEmail: users.email,
        planName: plans.name,
        planPeriod: plans.period,
        planCredits: plans.leadsCredits,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .orderBy(desc(transactions.createdAt));
  }

  static async acceptPayment(transactionId: number) {
    await db.transaction(async (txDB) => {
      const txRows = await txDB.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
      const tx = txRows[0];
      if (!tx) throw new Error('Transaction not found');
      if (tx.status === 'paid') throw new Error('Transaction already paid');

      const planRows = await txDB.select().from(plans).where(eq(plans.id, tx.planId!)).limit(1);
      const plan = planRows[0];
      if (!plan) throw new Error('Plan not found');

      // Mark transaction as paid
      await txDB.update(transactions).set({
        status: 'paid',
        updatedAt: new Date(),
      }).where(eq(transactions.id, transactionId));

      // Update user credits and plan
      await txDB.update(users).set({
        planType: plan.name.toLowerCase(),
        bonusCredits: sql`COALESCE(bonus_credits, 0) + ${plan.leadsCredits}`,
        subscriptionExpiry: SubscriptionService.computeExpiry(plan.period),
      }).where(eq(users.id, tx.userId!));
    });
  }

  static async rejectPayment(transactionId: number) {
    const tx = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1).then(r => r[0]);
    if (!tx) throw new Error('Transaction not found');
    if (tx.status === 'paid') throw new Error('Cannot reject a paid transaction');

    await db.update(transactions).set({
      status: 'rejected',
      updatedAt: new Date(),
    }).where(eq(transactions.id, transactionId));
  }
}
