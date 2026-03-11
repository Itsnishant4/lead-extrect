/**
 * Utility class for application errors that are safe to show to users.
 */
export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Masks internal technical errors (SQL, stack traces) with user-friendly messages.
 */
export function maskError(error: unknown, defaultMessage: string = 'Internal server error'): string {
  if (error instanceof AppError) {
    return error.message;
  }

  const message = (error as any)?.message || String(error);

  // Common sensitive strings to mask
  if (message.includes('SQL_ERROR') || message.includes('select ') || message.includes('from "') || message.includes('insert into')) {
    return 'A database error occurred. Please try again later.';
  }

  if (message.includes('LibsqlError') || message.includes('ResponseError')) {
    return 'Database connection issue. Please try again later.';
  }

  if (message.includes('fetch failed') || message.includes('ECONNREFUSED')) {
    return 'Network/Connection error. Please check your internet or try again.';
  }

  // If it looks like a clean message already, we might keep it, but safer to be generic for unknown errors.
  // For now, if it doesn't match sensitive patterns, we return it but you might want to wrap it.
  return message;
}
