import * as Sentry from '@sentry/react';

export function logError(context: string, error: unknown, extra?: Record<string, unknown>): void {
  if (extra !== undefined) {
    console.error(`[${context}]`, error, extra);
  } else {
    console.error(`[${context}]`, error);
  }

  // Forward to Sentry. No-op if VITE_SENTRY_DSN is not set
  // (Sentry.init() bails early in that case).
  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: { context },
      ...(extra ? { extra } : {}),
    });
  } else {
    Sentry.captureMessage(`[${context}] ${String(error)}`, {
      level: 'error',
      tags: { context },
      ...(extra ? { extra } : {}),
    });
  }
}

export function logWarn(context: string, message: string, extra?: Record<string, unknown>): void {
  if (extra !== undefined) {
    console.warn(`[${context}] ${message}`, extra);
  } else {
    console.warn(`[${context}] ${message}`);
  }

  Sentry.captureMessage(`[${context}] ${message}`, {
    level: 'warning',
    tags: { context },
    ...(extra ? { extra } : {}),
  });
}
