import { NextResponse } from 'next/server';
import { maskError, AppError } from './error.utils';

export function handleApiError(error: unknown) {
  console.error('[API ERROR HANDLER]', error);

  // If it's already an AppError, we use its status code if available
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 400 }
    );
  }

  // Mask all other errors
  const maskedMessage = maskError(error);
  
  return NextResponse.json(
    { success: false, error: maskedMessage },
    { status: (error as any)?.statusCode || 500 }
  );
}

// Helper to wrap route handlers (if using standard route objects)
export async function withErrorHandler(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (error) {
    return handleApiError(error);
  }
}
