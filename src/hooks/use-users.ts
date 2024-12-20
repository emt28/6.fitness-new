import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserRole } from '@/types/auth';
import { createUser, updateUser, deleteUser, getUsers } from '@/lib/mock-auth';
import { useQuery } from '@tanstack/react-query';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      assignedAthletes: string[];
      isActive: boolean;
    }) => {
      const user = await createUser(data);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const user = await updateUser(id, data);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const user = await updateUser(userId, { isActive });
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, preferences }: { 
      userId: string; 
      preferences: { 
        emailNotifications: boolean;
        reportUpdates: boolean;
        attendanceAlerts: boolean;
      }
    }) => {
      const user = await updateUser(userId, { preferences });
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ userId, currentPassword, newPassword }: {
      userId: string;
      currentPassword: string;
      newPassword: string;
    }) => {
      const user = await updateUser(userId, { password: newPassword });
      return user;
    },
  });
}