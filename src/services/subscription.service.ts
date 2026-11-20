import { db } from '@/lib/db';
import { transactions, users, plans } from '@/lib/db/schema';
import { eq, sql, desc, ne, lt, count, and } from 'drizzle-orm';
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

    const transactionRows = await db.select().from(transactions).where(eq(transactions.gatewayOrderId, order_id)).limit(1);
    const transaction = transactionRows[0];
    
    if (!transaction) throw new Error('Transaction not found');
    
    if (transaction.status === 'paid') {
      console.log(`[WEBHOOK] Transaction ${order_id} already processed, skipping`);
      return { alreadyProcessed: true, transactionId: transaction.id };
    }

    const planRows = await db.select().from(plans).where(eq(plans.id, transaction.planId!)).limit(1);
    const plan = planRows[0];
    if (!plan) throw new Error('Plan not found');

    const updateResult = await db.update(transactions)
      .set({ status: 'paid', utr: utr, updatedAt: new Date() })
      .where(and(eq(transactions.id, transaction.id), eq(transactions.status, 'pending')));

    if ((updateResult as any).rowsAffected === 0) {
      console.log(`[WEBHOOK] Transaction ${order_id} concurrent update detected, skipping`);
      return { alreadyProcessed: true, transactionId: transaction.id };
    }

    try {
      await db.update(users).set({
        planType: plan.name.toLowerCase(),
        bonusCredits: sql`COALESCE(${users.bonusCredits}, 0) + ${plan.leadsCredits}`,
        subscriptionExpiry: SubscriptionService.computeExpiry(plan.period),
      }).where(eq(users.id, transaction.userId!));

      const uid = transaction.userId!;
      const pName = plan.name;
      const pAmount = amount || transaction.amount;
      try {
        await NotificationService.notifyPaymentSuccess(uid, pName, String(pAmount));
      } catch (notifErr) {
        console.error('[WEBHOOK] Failed to send payment notification:', notifErr);
      }

      return { success: true, transactionId: transaction.id };
    } catch (error) {
      console.error('[WEBHOOK] Payment processing failed:', error);
      await db.update(transactions).set({
        status: 'failed',
        updatedAt: new Date(),
      }).where(eq(transactions.id, transaction.id));
      throw error;
    }
  }

  static async reconcilePayments() {
    const paidTransactions = await db.select().from(transactions).where(eq(transactions.status, 'paid'));
    
    const reconciled: number[] = [];
    const errors: string[] = [];

    for (const tx of paidTransactions) {
      const user = await db.select().from(users).where(eq(users.id, tx.userId!)).limit(1).then(r => r[0]);
      if (!user) {
        errors.push(`TX ${tx.id}: User ${tx.userId} not found`);
        continue;
      }

      const plan = await db.select().from(plans).where(eq(plans.id, tx.planId!)).limit(1).then(r => r[0]);
      if (!plan) {
        errors.push(`TX ${tx.id}: Plan ${tx.planId} not found`);
        continue;
      }

      const isExpired = user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date();
      const hasCorrectPlan = user.planType?.toLowerCase() === plan.name.toLowerCase();

      if (!hasCorrectPlan || isExpired) {
        try {
          await db.update(users).set({
            planType: plan.name.toLowerCase(),
            bonusCredits: sql`COALESCE(${users.bonusCredits}, 0) + ${plan.leadsCredits}`,
            subscriptionExpiry: SubscriptionService.computeExpiry(plan.period),
          }).where(eq(users.id, tx.userId!));
          reconciled.push(tx.id);
        } catch (e: any) {
          errors.push(`TX ${tx.id}: Reconciliation failed - ${e.message}`);
        }
      }
    }

    return { reconciled: reconciled.length, errors };
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
    const txRows = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
    const tx = txRows[0];
    if (!tx) throw new Error('Transaction not found');
    if (tx.status === 'paid') throw new Error('Transaction already paid');

    const planRows = await db.select().from(plans).where(eq(plans.id, tx.planId!)).limit(1);
    const plan = planRows[0];
    if (!plan) throw new Error('Plan not found');

    // Perform updates sequentially due to LibSQL proxy batch issues
    await db.update(transactions).set({
      status: 'paid',
      updatedAt: new Date(),
    }).where(eq(transactions.id, transactionId));

    await db.update(users).set({
      planType: plan.name.toLowerCase(),
      bonusCredits: sql`COALESCE(bonus_credits, 0) + ${plan.leadsCredits}`,
      subscriptionExpiry: SubscriptionService.computeExpiry(plan.period),
    }).where(eq(users.id, tx.userId!));
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

  static async checkAndDowngradeExpired(userId: number): Promise<{ downgraded: boolean; previousPlan: string } | null> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(r => r[0]);
    if (!user) return null;
    if (user.planType === 'free') return null;
    if (!user.subscriptionExpiry) return null;

    if (new Date(user.subscriptionExpiry) < new Date()) {
      const previousPlan = user.planType || 'free';
      await db.update(users).set({ planType: 'free' }).where(eq(users.id, userId));
      return { downgraded: true, previousPlan };
    }
    return null;
  }

  static async checkExpiringSoon(userId: number): Promise<number | null> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(r => r[0]);
    if (!user || user.planType === 'free' || !user.subscriptionExpiry) return null;

    const expiryDate = new Date(user.subscriptionExpiry);
    const now = new Date();
    const msLeft = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3 && daysLeft > 0) {
      return daysLeft;
    }
    return null;
  }

  static async processAllExpiredSubscriptions(): Promise<number> {
    const expiredUsers = await db.select({ id: users.id })
      .from(users)
      .where(and(
        sql`${users.planType} != 'free'`,
        sql`${users.subscriptionExpiry} IS NOT NULL`,
        sql`${users.subscriptionExpiry} < datetime('now')`
      ));

    let count = 0;
    for (const user of expiredUsers) {
      await db.update(users).set({ planType: 'free' }).where(eq(users.id, user.id));
      count++;
    }
    return count;
  }
}
