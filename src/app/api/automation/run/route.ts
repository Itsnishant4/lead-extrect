import { NextRequest, NextResponse, after } from 'next/server';
import { InternalService } from '@/services/internal.service';
import { verifyToken } from '@/lib/auth-edge';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const xInternalToken = req.headers.get('x-internal-token');
    
    console.log(`API [automation/run] Received request. 
      Auth Header: ${authHeader ? 'Present (length: ' + authHeader.length + ')' : 'Missing'},
      X-Internal-Token: ${xInternalToken ? 'Present' : 'Missing'}`);

    const body = await req.json();
    const taskId = Number(body.taskId);
    const userId = Number(body.userId);

    if (!taskId || !userId) {
      console.error('API [automation/run] Missing taskId or userId:', body);
      return NextResponse.json({ success: false, error: 'Missing taskId or userId' }, { status: 400 });
    }

    let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    // Fallback to custom header if Authorization is missing or malformed
    if (!token && xInternalToken) {
      console.log('API [automation/run] Using x-internal-token fallback');
      token = xInternalToken;
    }

    if (!token) {
      console.error('API [automation/run] Missing or malformed token in header. AuthHeader:', authHeader, 'xInternalToken:', xInternalToken ? 'Present' : 'Missing');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized', 
        debug: { 
          headerFound: !!authHeader, 
          headerValue: authHeader ? authHeader.substring(0, 15) + '...' : null,
          xInternalTokenFound: !!xInternalToken
        } 
      }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      console.error('API [automation/run] Token verification failed');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token',
        debug: { hasToken: !!token }
      }, { status: 401 });
    }

    const payloadInternal = payload.internal;
    const payloadTaskId = Number(payload.taskId);
    const payloadUserId = Number(payload.userId);

    if (!payloadInternal || payloadTaskId !== taskId || payloadUserId !== userId) {
      console.error('API [automation/run] Unauthorized token payload:', { 
        payload, 
        expectedTaskId: taskId, 
        expectedUserId: userId 
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized token payload',
        debug: {
          isInternal: !!payloadInternal,
          taskIdMatch: payloadTaskId === taskId,
          userIdMatch: payloadUserId === userId,
          payloadTaskId,
          payloadUserId,
          receivedTaskId: taskId,
          receivedUserId: userId
        }
      }, { status: 401 });
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
