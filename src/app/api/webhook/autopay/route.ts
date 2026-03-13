import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription.service';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { checkRateLimit } from '@/lib/security/ratelimit';
import { z } from 'zod';
import crypto from 'crypto';

const webhookPayloadSchema = z.object({
  order_id: z.string(),
  amount: z.string().optional(),
  utr: z.string().optional(),
  status: z.string(),
});

function verifySignature(body: string, signature: string): boolean {
  const apiKey = process.env.AUTOPAY_API_KEY;
  if (!apiKey) {
    console.error('[WEBHOOK] AUTOPAY_API_KEY not configured');
    return false;
  }

  if (!signature || signature.length !== 64) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitKey = `webhook:autopay:${clientIp}`;
    
    const allowed = await checkRateLimit(rateLimitKey, 30, 60000); // 30 requests per minute per IP
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const signature = req.headers.get('x-gateway-signature');
    const rawBody = await req.text();

    if (!signature) {
      return NextResponse.json({ success: false, error: 'Missing signature' }, { status: 400 });
    }

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const validatedData = webhookPayloadSchema.parse(body);

    if (validatedData.status === 'paid') {
      const result = await SubscriptionService.handleSuccessfulPayment(validatedData);
      
      if (result?.alreadyProcessed) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
