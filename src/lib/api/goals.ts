import { supabase } from '../supabase';
import type { DevelopmentGoal, CreateGoalData, GoalNote, CreateGoalNoteData } from '@/types/development';

export async function getGoals(athleteId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select(`
      *,
      protocol:protocols(*),
      assignedTo:users_extension(*)
    `)
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function createGoal(data: CreateGoalData & { athleteId: string }) {
  const { data: goal, error } = await supabase
    .from('goals')
    .insert([{
      athlete_id: data.athleteId,
      title: data.title,
      description: data.description,
      category: data.category,
      target_metric: data.targetMetric,
      deadline: data.deadline,
      protocol_id: data.protocolId,
      assigned_to: data.assignedTo,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return goal;
}

export async function addGoalNote(goalId: string, data: CreateGoalNoteData) {
  const { data: note, error } = await supabase
    .from('goal_notes')
    .insert([{
      goal_id: goalId,
      text: data.text,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return note;
}