import { supabase } from '../supabase';
import type { CoachNote } from '@/types/note';

export async function getCoachNotes(athleteId: string) {
  const { data, error } = await supabase
    .from('coach_notes')
    .select(`
      *,
      createdBy:users_extension(*)
    `)
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function createCoachNote(athleteId: string, data: {
  content: string;
  type: CoachNote['type'];
  visibility: CoachNote['visibility'];
}) {
  const { data: note, error } = await supabase
    .from('coach_notes')
    .insert([{
      athlete_id: athleteId,
      content: data.content,
      type: data.type,
      visibility: data.visibility,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return note;
}