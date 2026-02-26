import { NextRequest, NextResponse, after } from 'next/server';
import { TaskRunnerService } from '@/services/task-runner.service';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  after(async () => {
    try {
      await TaskRunnerService.resumeStalledTasks();
    } catch (error) {
      console.error('[CRON] Background Error:', error);
    }
  });

  return NextResponse.json({ success: true, message: 'Cron task initiated' });
}
