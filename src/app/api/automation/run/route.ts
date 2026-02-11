import { NextRequest, NextResponse } from 'next/server';
import { processTaskStepAction } from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const { taskId, userId } = await req.json();
    
    if (!taskId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing taskId or userId' }, { status: 400 });
    }

    // Call the worker action
    // Note: We don't await the worker if we want it to be truly background, 
    // but in a serverless environment like Vercel, we MUST await at least the first step 
    // or use a specialized background job service.
    // For local dev, this works fine.
    const res = await processTaskStepAction(taskId, userId);
    
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
