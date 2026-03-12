import { NextResponse } from 'next/server';
import { maskError, AppError, ValidationError } from './error.utils';
import { z } from 'zod';

export function handleApiError(error: unknown) {
  console.error('[API ERROR HANDLER]', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 400 }
    );
  }

  const maskedMessage = maskError(error);
  
  return NextResponse.json(
    { success: false, error: maskedMessage },
    { status: (error as any)?.statusCode || 500 }
  );
}

export async function withErrorHandler(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (error) {
    return handleApiError(error);
  }
}

export function validateRequest<T extends z.ZodSchema>(schema: T) {
  return (data: unknown): z.infer<T> => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      throw new ValidationError(messages);
    }
    return result.data;
  };
}
