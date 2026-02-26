import { NextResponse } from 'next/server';
import { TaskRunnerService } from '@/services/task-runner.service';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await TaskRunnerService.resumeStalledTasks();
    return NextResponse.json({ success: true, message: 'Cron job executed successfully' });
  } catch (error) {
    console.error('[CRON] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
