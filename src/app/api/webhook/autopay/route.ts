import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription.service';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { z } from 'zod';

const webhookPayloadSchema = z.object({
  order_id: z.string(),
  amount: z.string().optional(),
  utr: z.string().optional(),
  status: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = webhookPayloadSchema.parse(body);

    if (validatedData.status === 'paid') {
      await SubscriptionService.handleSuccessfulPayment(validatedData);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
