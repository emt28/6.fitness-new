import { pb } from './pocketbase';
import { UserRole } from '@/types/auth';

export async function signIn(email: string, password: string) {
  return await pb.collection('users').authWithPassword(email, password);
}

export async function signUp(email: string, password: string, role: UserRole, name: string) {
  return await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    role,
    name,
  });
}

export async function signOut() {
  pb.authStore.clear();
}

export function requireAuth(allowedRoles?: UserRole[]) {
  const user = pb.authStore.model;
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}