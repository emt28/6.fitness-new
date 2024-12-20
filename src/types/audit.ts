export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

export type AuditAction =
  | 'user_created'
  | 'user_updated'
  | 'role_changed'
  | 'athlete_assigned'
  | 'permission_updated';