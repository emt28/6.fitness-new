import { pb } from './pocketbase';
import { AuditAction } from '@/types/audit';

export async function logAuditEvent(action: AuditAction, details: string) {
  const user = pb.authStore.model;
  if (!user) return;

  return await pb.collection('audit_logs').create({
    action,
    userId: user.id,
    userName: user.name,
    details,
    timestamp: new Date().toISOString(),
  });
}