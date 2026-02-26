import { NextRequest, NextResponse, after } from 'next/server';
import { InternalService } from '@/services/internal.service';
import { verifyToken } from '@/lib/auth-edge';

export async function POST(req: NextRequest) {
  try {
    const { taskId, userId } = await req.json();

    if (!taskId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing taskId or userId' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.internal || payload.taskId !== taskId || payload.userId !== userId) {
      console.error('API [automation/run] Unauthorized or invalid token:', { payload, taskId, userId });
      return NextResponse.json({ success: false, error: 'Unauthorized or invalid token' }, { status: 401 });
    }

    console.log(`API [automation/run] Triggering task ${taskId} for user ${userId}`);

    // Call the worker service directly
    after(() => {
      InternalService.processTaskStepInternal(taskId, userId).catch(err => {
        console.error(`Background process failed for task ${taskId}:`, err);
      });
    });

    return NextResponse.json({ success: true, message: 'Processing started in background' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
