import { supabase } from '../supabase';
import type { Athlete, CreateAthleteData } from '@/types/athlete';

export async function getAthletes() {
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}

export async function createAthlete(data: CreateAthleteData) {
  const { data: athlete, error } = await supabase
    .from('athletes')
    .insert([data])
    .select()
    .single();
    
  if (error) throw error;
  return athlete;
}

export async function updateAthlete(id: string, data: Partial<CreateAthleteData>) {
  const { data: athlete, error } = await supabase
    .from('athletes')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return athlete;
}

export async function deleteAthlete(id: string) {
  const { error } = await supabase
    .from('athletes')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}