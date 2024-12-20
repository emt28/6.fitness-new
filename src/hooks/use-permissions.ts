import { useAuth } from '@/contexts/auth-context';
import { Permission, hasPermission } from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuth();

  return {
    can: (permission: Permission) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    role: user?.role,
  };
}