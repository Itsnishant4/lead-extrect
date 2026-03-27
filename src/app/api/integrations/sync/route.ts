import { NextRequest, NextResponse } from 'next/server';
import { IntegrationService } from '@/services/integration.service';

// Called by external workers/automations to sync a completed task
// POST /api/integrations/sync with x-webhook-key header and { taskId }
export async function POST(request: NextRequest) {
  try {
    const bearer = request.headers.get('authorization');
    const headerKey = request.headers.get('x-webhook-key');
    const webhookKey = headerKey || (bearer?.startsWith('Bearer ') ? bearer.slice(7) : null);

    if (!webhookKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await IntegrationService.resolveUserIdByWebhookSyncKey(webhookKey);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid webhook key' }, { status: 401 });
    }

    const body = await request.json();
    const taskId = Number(body?.taskId);
    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const syncResult = await IntegrationService.syncAllForTask(userId, taskId);

    return NextResponse.json({
      success: true,
      userId,
      taskId,
      ...syncResult,
    });
  } catch (error: any) {
    console.error('Integration sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
