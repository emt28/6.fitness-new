import { supabase } from '../supabase';
import type { Assessment, CreateAssessmentData } from '@/types/assessment';
import { calculatePerformanceLevel } from '../utils';

export async function getAssessments(athleteId?: string) {
  let query = supabase
    .from('assessments')
    .select('*, athlete:athletes(*), protocol:protocols(*), assessedBy:users_extension(*))')
    .order('assessed_at', { ascending: false });
    
  if (athleteId) {
    query = query.eq('athlete_id', athleteId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createAssessment(data: CreateAssessmentData) {
  // Get protocol for performance level calculation
  const { data: protocol, error: protocolError } = await supabase
    .from('protocols')
    .select('*')
    .eq('id', data.protocolId)
    .single();
    
  if (protocolError) throw protocolError;

  const performanceLevel = calculatePerformanceLevel(data.value, protocol);

  const { data: assessment, error } = await supabase
    .from('assessments')
    .insert([{
      athlete_id: data.athleteId,
      protocol_id: data.protocolId,
      value: data.value,
      performance_level: performanceLevel,
      notes: data.notes,
      assessed_at: data.assessedAt || new Date().toISOString(),
    }])
    .select()
    .single();
    
  if (error) throw error;
  return assessment;
}