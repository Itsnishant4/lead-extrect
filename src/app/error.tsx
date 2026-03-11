'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { maskError } from '@/lib/utils/error.utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('[GLOBAL UI ERROR]', error);
  }, [error]);

  const userMessage = maskError(error, 'Something went wrong while rendering this page.');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Oops!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {userMessage}
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          Go to Dashboard
        </Button>
        <Button
          onClick={() => reset()}
        >
          Try again
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-muted rounded-lg text-left overflow-auto max-w-2xl max-h-48 text-xs font-mono">
          <p className="font-bold mb-2 text-red-400">Debug Info (Development Only):</p>
          <pre>{error.stack}</pre>
        </div>
      )}
    </div>
  );
}
