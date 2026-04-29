import type { Handler } from '@netlify/functions';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize firebase-admin once per cold start. The service account JSON is
// stored as a single-line env var in Netlify (Site settings → Environment).
let adminApp: App | null = null;
function getAdminApp(): App {
  if (adminApp) return adminApp;
  const existing = getApps()[0];
  if (existing) {
    adminApp = existing;
    return existing;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is missing');
  }
  const credentials = JSON.parse(raw);
  adminApp = initializeApp({ credential: cert(credentials) });
  return adminApp;
}

const json = (statusCode: number, body: Record<string, unknown>) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  // 1. Extract and verify Firebase ID token
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return json(401, { error: 'Missing bearer token' });
  }
  const idToken = match[1];

  let email: string;
  try {
    const app = getAdminApp();
    const decoded = await getAuth(app).verifyIdToken(idToken);
    if (!decoded.email) {
      return json(401, { error: 'Token has no email' });
    }
    email = decoded.email.toLowerCase();
  } catch (err) {
    console.error('Token verification failed:', err);
    return json(401, { error: 'Invalid token' });
  }

  // 2. Check the user is an Administrator (role lives in Firestore)
  try {
    const app = getAdminApp();
    const userSnap = await getFirestore(app).collection('users').doc(email).get();
    if (!userSnap.exists) {
      return json(403, { error: 'User profile not found' });
    }
    const role = (userSnap.data() as { role?: string } | undefined)?.role;
    if (role !== 'Administrateur') {
      return json(403, { error: 'Insufficient privileges' });
    }
  } catch (err) {
    console.error('Role check failed:', err);
    return json(500, { error: 'Could not verify role' });
  }

  // 3. Forward the payload to n8n. The URL lives only in env vars,
  //    never in the client bundle.
  const targetUrl = process.env.N8N_WEBHOOK_URL;
  if (!targetUrl) {
    return json(500, { error: 'N8N_WEBHOOK_URL env var is missing' });
  }

  let payload: unknown;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  try {
    // Re-stamp the verified user so n8n can trust who triggered it,
    // independently of what the client claims.
    const enriched = { ...(payload as Record<string, unknown>), verifiedUserEmail: email };

    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error(`n8n returned ${upstream.status}:`, text);
      return json(502, { error: 'Upstream webhook failed', status: upstream.status });
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error('Forward to n8n failed:', err);
    return json(502, { error: 'Could not reach upstream webhook' });
  }
};
