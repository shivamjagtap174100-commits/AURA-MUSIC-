import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('example.com')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Safe query runner that logs errors gracefully
export async function safeDbQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: unknown }>
): Promise<{ data: T | null; error: string | null }> {
  if (!supabase) {
    return { data: null, error: 'SUPABASE_NOT_CONFIGURED' };
  }
  try {
    const { data, error } = await queryFn(supabase);
    if (error) {
      console.warn('[Supabase Query Warning]:', error);
      return { data: null, error: String((error as Error)?.message || error) };
    }
    return { data, error: null };
  } catch (err) {
    console.warn('[Supabase Network/Fetch Error]:', err);
    return { data: null, error: (err as Error).message };
  }
}

