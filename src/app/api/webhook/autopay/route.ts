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
    const signature = req.headers.get('x-gateway-signature');

    if (!signature) {
      return NextResponse.json({ success: false, error: 'Missing signature' }, { status: 400 });
    }

    const validatedData = webhookPayloadSchema.parse(body);

    const isValid = await SubscriptionService.verifyWebhook(validatedData, signature);

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }

    if (validatedData.status === 'paid') {
      await SubscriptionService.handleSuccessfulPayment(validatedData);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
