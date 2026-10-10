import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { UserRole } from '../types';

// Safe environment resolution supporting both Vite browser and Node.js test environments
const env: Record<string, any> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : typeof process !== 'undefined' && process.env
    ? process.env
    : {};

const rawSupabaseUrl: string = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
const supabaseUrl: string = rawSupabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey: string = (env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '').trim();

// Detect if valid configuration is provided (not empty and not placeholder)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
  hasAnonKey: boolean;
  statusText: string;
  authSupported: boolean;
  storageSupported: boolean;
  databaseSupported: boolean;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  if (isSupabaseConfigured && supabase) {
    try {
      const parsed = new URL(supabaseUrl);
      return {
        isConfigured: true,
        url: parsed.hostname,
        hasAnonKey: true,
        statusText: 'Configured and Connected',
        authSupported: true,
        storageSupported: true,
        databaseSupported: true,
      };
    } catch {
      // Fallback
    }
  }

  return {
    isConfigured: false,
    url: null,
    hasAnonKey: false,
    statusText: 'Unconfigured (Offline Demo Mode)',
    authSupported: false,
    storageSupported: false,
    databaseSupported: false,
  };
}

// ============================================================================
// SUPABASE AUTH HELPERS
// ============================================================================

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[Supabase Auth] Failed to fetch session:', error.message);
    return null;
  }
  return data.session;
}

export async function getCurrentAuthUser(): Promise<SupabaseAuthUser | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('[Supabase Auth] Failed to fetch user:', error.message);
    return null;
  }
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, metadata?: { full_name?: string; role?: UserRole; org_id?: string }) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata || {},
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogleOAuth() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutSupabase() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ============================================================================
// SUPABASE STORAGE HELPERS
// ============================================================================

export async function uploadFileToSupabaseStorage(
  bucket: 'assignment-submissions' | 'course-documents' | 'organization-assets',
  filePath: string,
  file: File | Blob
): Promise<{ path: string; publicUrl: string }> {
  if (!supabase) {
    throw new Error('Supabase storage is not configured.');
  }

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

export function getStoragePublicUrl(
  bucket: 'assignment-submissions' | 'course-documents' | 'organization-assets',
  filePath: string
): string {
  if (!supabase) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

// ============================================================================
// SUPABASE DATABASE (ORGANIZATION ISOLATED & RBAC QUERIES)
// ============================================================================

export async function fetchLiveAssignments(orgId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      id,
      title,
      subject,
      class_group,
      description,
      due_date,
      max_points,
      status,
      assigned_by:profiles!assignments_assigned_by_fkey(full_name, role)
    `)
    .eq('org_id', orgId);

  if (error) throw error;
  return data;
}

export async function fetchLiveDocuments(orgId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('org_id', orgId);

  if (error) throw error;
  return data;
}

export async function fetchLiveChannels(orgId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('org_id', orgId);

  if (error) throw error;
  return data;
}

export async function submitAssignmentWorkOnline(
  orgId: string,
  assignmentId: string,
  studentId: string,
  notes: string,
  fileUrl?: string
) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('submissions')
    .upsert({
      org_id: orgId,
      assignment_id: assignmentId,
      student_id: studentId,
      notes,
      file_url: fileUrl || null,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
