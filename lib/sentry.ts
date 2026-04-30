import * as Sentry from '@sentry/react';

/**
 * Errors that aren't actionable on our side and would just consume the
 * monthly Sentry quota. Matches the message of the original exception.
 */
const IGNORED_ERROR_PATTERNS = [
  /NetworkError/i,
  /Failed to fetch/i,
  /Load failed/i,
  /Network request failed/i,
  /AbortError/i,
  /The operation was aborted/i,
  // ResizeObserver loops are benign browser quirks, not bugs.
  /ResizeObserver loop/i,
  // Firebase Auth flow throws expected errors on bad credentials; surfaced
  // to the user via the UI, no need to alert on them.
  /auth\/(invalid-credential|wrong-password|user-not-found|too-many-requests|email-already-in-use)/i,
];

function shouldIgnore(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    // Quietly skip in dev or when the env var is missing. Avoids forcing
    // every contributor to set up a Sentry project to run the app.
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // sendDefaultPii: false (default) — we explicitly do NOT collect IPs
    // or browser locale/timezone for GDPR safety. User identification
    // happens explicitly via Sentry.setUser() after login.
    sendDefaultPii: false,
    // No performance / replay data — only errors, to stay well under the
    // free tier's monthly event quota.
    tracesSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
    integrations: [],
    beforeSend(event, hint) {
      const original = hint?.originalException;
      if (original && shouldIgnore(original)) {
        return null;
      }

      // Drop events triggered from inside browser extensions — frequent
      // false positives from password managers and ad blockers.
      const fromExtension = event.exception?.values?.some((value) =>
        value.stacktrace?.frames?.some((frame) => {
          const file = frame.filename || '';
          return file.startsWith('chrome-extension://') || file.startsWith('moz-extension://');
        })
      );
      if (fromExtension) return null;

      // Strip anything that looks like a password from breadcrumbs even
      // if a feature accidentally captured one.
      if (event.breadcrumbs) {
        for (const breadcrumb of event.breadcrumbs) {
          if (breadcrumb.data && typeof breadcrumb.data === 'object') {
            for (const key of Object.keys(breadcrumb.data)) {
              if (/password|token|secret|authorization/i.test(key)) {
                breadcrumb.data[key] = '[redacted]';
              }
            }
          }
        }
      }

      return event;
    },
  });
}

/**
 * Tag the current Sentry session with an authenticated user. Call after
 * a successful login so issues can be attributed to a real account
 * (we send the email as ID — RGPD note: any user can request deletion of
 * their Sentry events via the dashboard).
 */
export function identifySentryUser(email: string): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.setUser({ email });
}

/**
 * Drop the user identity from Sentry on logout so subsequent anonymous
 * errors aren't tied to the previous account.
 */
export function clearSentryUser(): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.setUser(null);
}
