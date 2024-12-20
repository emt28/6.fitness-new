import { UserRole } from '@/types/auth';

export const ROLE_PERMISSIONS = {
  admin: [
    'manage_users',
    'manage_athletes',
    'manage_assessments',
    'manage_reports',
    'view_all',
    'view_reports',
  ],
  lead_coach: [
    'manage_athletes',
    'manage_assessments',
    'view_reports',
    'view_assigned_athletes',
  ],
  academy_coach: [
    'manage_assessments',
    'view_assigned_athletes',
  ],
  fitness_trainer: [
    'manage_assessments',
    'view_assigned_athletes',
  ],
  parent: [
    'view_assigned_athletes',
    'view_child_data',
  ],
  player: [
    'view_own_data',
  ],
} as const;

export type Permission = typeof ROLE_PERMISSIONS[UserRole][number];

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canViewAthlete(userRole: UserRole, userAssignments: any[], athleteId: string): boolean {
  if (userRole === 'admin') return true;
  
  if (userRole === 'parent' || userRole === 'fitness_trainer' || userRole === 'academy_coach') {
    return userAssignments?.some(assignment => assignment.athleteId === athleteId);
  }
  
  return hasPermission(userRole, 'view_all');
}

export function canManageAthletes(role: UserRole): boolean {
  return hasPermission(role, 'manage_athletes');
}

export function canViewAllAthletes(role: UserRole): boolean {
  return hasPermission(role, 'view_all');
}

export function canManageAssessments(role: UserRole): boolean {
  return hasPermission(role, 'manage_assessments');
}

export function canViewReports(role: UserRole): boolean {
  return hasPermission(role, 'view_reports') || hasPermission(role, 'manage_reports');
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'manage_users');
}