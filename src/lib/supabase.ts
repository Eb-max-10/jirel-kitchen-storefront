import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Validates whether Supabase environment variables are present and point
 * to a real URL (not empty or template placeholder).
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (
    url.includes('your-project') ||
    url.includes('placeholder') ||
    url.includes('example.com')
  ) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

let browserClientInstance: SupabaseClient | null = null;

/**
 * Client-side and server-side reader instance with anon key.
 * Returns null if Supabase credentials are not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!browserClientInstance) {
    browserClientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return browserClientInstance;
}

/**
 * Convenience alias for public client
 */
export const supabase = isSupabaseConfigured()
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
  : null;

/**
 * Server-only client using SUPABASE_SERVICE_ROLE_KEY.
 * Used exclusively in API route handlers (e.g. /api/checkout/verify)
 * to verify transactions and write confirmed order records.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !isSupabaseConfigured()) {
    return null;
  }

  // Use service role key if available and not a placeholder; otherwise fall back to anon key
  const activeKey =
    serviceKey && !serviceKey.includes('placeholder') && !serviceKey.includes('your_')
      ? serviceKey
      : anonKey;

  if (!activeKey) {
    return null;
  }

  return createClient(url, activeKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Convenience alias for admin client
 */
export const createAdminClient = getSupabaseAdminClient;
