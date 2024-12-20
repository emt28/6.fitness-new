import { supabase } from '../supabase';
import type { AuditAction } from '@/types/audit';

export async function getAuditLogs() {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:users_extension(*)
    `)
    .order('timestamp', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function logAuditEvent(action: AuditAction, details: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated to log audit events');

  const { error } = await supabase
    .from('audit_logs')
    .insert([{
      action,
      user_id: user.id,
      details,
    }]);
    
  if (error) throw error;
}