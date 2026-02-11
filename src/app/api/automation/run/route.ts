import { NextRequest, NextResponse } from 'next/server';
import { processTaskStepAction } from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const { taskId, userId } = await req.json();

    if (!taskId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing taskId or userId' }, { status: 400 });
    }

    // Call the worker action
    // We do NOT await this. We want to return 200 immediately to the caller (fire-and-forget).
    // This prevents the caller (fetch) from timing out (HeadersTimeoutError).
    // In local dev, this allows the process to run in the background.
    // In Vercel serverless, this might be terminated early, but checking 'await' would cause a timeout anyway.

    // We catch errors to prevent unhandled rejections crashing the process
    processTaskStepAction(taskId, userId).catch(err => {
      console.error(`Background process failed for task ${taskId}:`, err);
    });

    return NextResponse.json({ success: true, message: 'Processing started in background' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
