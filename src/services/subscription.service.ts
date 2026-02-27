import { db } from '@/lib/db';
import { transactions, users, plans } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import crypto from 'crypto';

export class SubscriptionService {
  static async createOrder(userId: number, planId: number) {
    const plan = await db.select().from(plans).where(eq(plans.id, planId)).limit(1).then(res => res[0]);
    if (!plan) throw new Error('Plan not found');

    const transaction = await db.insert(transactions).values({
      userId,
      planId,
      amount: plan.price.toString(),
      status: 'pending',
    }).returning({ id: transactions.id });

    const orderId = `ORD-${transaction[0].id}-${Date.now()}`;
    
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

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create order with gateway');
    }

    // Update transaction with gateway order ID and exact amount
    await db.update(transactions).set({
      gatewayOrderId: orderId,
      amount: result.data.amount, // Use the fractional amount from gateway
    }).where(eq(transactions.id, transaction[0].id));

    return {
      paymentUrl: result.data.payment_url,
      orderId: orderId,
    };
  }

  static async verifyWebhook(body: any, signature: string) {
    const expectedSignature = crypto.createHmac('sha256', process.env.AUTOPAY_API_KEY || '')
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }

  static async handleSuccessfulPayment(data: any) {
    const { order_id, amount, utr } = data;

    const transaction = await db.select().from(transactions).where(eq(transactions.gatewayOrderId, order_id)).limit(1).then(res => res[0]);
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status === 'paid') return; // Already processed

    const plan = await db.select().from(plans).where(eq(plans.id, transaction.planId!)).limit(1).then(res => res[0]);
    if (!plan) throw new Error('Plan not found');

    // Update transaction
    await db.update(transactions).set({
      status: 'paid',
      utr: utr,
      updatedAt: new Date(),
    }).where(eq(transactions.id, transaction.id));

    // Update user credits and plan
    await db.update(users).set({
      planType: plan.name.toLowerCase(),
      bonusCredits: sql`COALESCE(${users.bonusCredits}, 0) + ${plan.leadsCredits}`,
      subscriptionExpiry: plan.period === 'month' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        : null,
    }).where(eq(users.id, transaction.userId!));
  }

  static async getPaymentHistory(userId: number) {
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
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));

    return rows;
  }
}
