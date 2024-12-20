import { supabase } from '../supabase';
import type { TestProtocol, CreateTestProtocolData } from '@/types/protocol';

export async function getProtocols() {
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}

export async function createProtocol(data: CreateTestProtocolData) {
  const { data: protocol, error } = await supabase
    .from('protocols')
    .insert([data])
    .select()
    .single();
    
  if (error) throw error;
  return protocol;
}

export async function updateProtocol(id: string, data: Partial<CreateTestProtocolData>) {
  const { data: protocol, error } = await supabase
    .from('protocols')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return protocol;
}

export async function deleteProtocol(id: string) {
  const { error } = await supabase
    .from('protocols')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}