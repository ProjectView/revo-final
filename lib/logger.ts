const isDev = import.meta.env.DEV;

export function logError(context: string, error: unknown, extra?: Record<string, unknown>): void {
  if (isDev) {
    console.error(`[${context}]`, error, extra ?? '');
  }
}

export function logWarn(context: string, message: string, extra?: Record<string, unknown>): void {
  if (isDev) {
    console.warn(`[${context}] ${message}`, extra ?? '');
  }
}
