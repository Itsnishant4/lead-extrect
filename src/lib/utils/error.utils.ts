/**
 * Utility class for application errors that are safe to show to users.
 */
export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
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
