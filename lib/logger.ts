export function logError(context: string, error: unknown, extra?: Record<string, unknown>): void {
  if (extra !== undefined) {
    console.error(`[${context}]`, error, extra);
  } else {
    console.error(`[${context}]`, error);
  }
}

export function logWarn(context: string, message: string, extra?: Record<string, unknown>): void {
  if (extra !== undefined) {
    console.warn(`[${context}] ${message}`, extra);
  } else {
    console.warn(`[${context}] ${message}`);
  }
}
