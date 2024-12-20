import { supabase } from '../supabase';
import type { User, UserRole } from '@/types/auth';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data.user;
}

export async function signUp(email: string, password: string, role: UserRole, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role,
      },
    },
  });
  
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUsers() {
  const { data, error } = await supabase
    .from('users_extension')
    .select('*');
    
  if (error) throw error;
  return data;
}

export async function updateUser(id: string, data: Partial<User>) {
  const { error } = await supabase
    .from('users_extension')
    .update(data)
    .eq('id', id);
    
  if (error) throw error;
}

export async function deleteUser(id: string) {
  const { error } = await supabase
    .from('users_extension')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}