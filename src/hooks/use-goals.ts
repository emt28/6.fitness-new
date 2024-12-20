import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DevelopmentGoal, CreateGoalData, CreateGoalNoteData } from '@/types/development';

// In-memory storage for goals
let goals: DevelopmentGoal[] = [];

// Mock functions - replace with actual API calls
async function getGoals(athleteId: string): Promise<DevelopmentGoal[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return goals.filter(g => g.athleteId === athleteId);
}

async function createGoal(data: CreateGoalData & { athleteId: string }): Promise<DevelopmentGoal> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newGoal: DevelopmentGoal = {
    id: String(Math.random()),
    ...data,
    progress: 0,
    status: 'onTrack',
    notes: [],
    createdBy: '1',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  goals = [...goals, newGoal];
  return newGoal;
}

async function updateGoal(id: string, data: Partial<CreateGoalData>): Promise<DevelopmentGoal> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = goals.findIndex(g => g.id === id);
  if (index === -1) throw new Error('Goal not found');

  const updatedGoal = {
    ...goals[index],
    ...data,
    updated: new Date().toISOString(),
  };

  goals = [
    ...goals.slice(0, index),
    updatedGoal,
    ...goals.slice(index + 1),
  ];

  return updatedGoal;
}

async function deleteGoal(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  goals = goals.filter(g => g.id !== id);
}

async function addGoalNote(goalId: string, data: CreateGoalNoteData): Promise<DevelopmentGoal> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = goals.findIndex(g => g.id === goalId);
  if (index === -1) throw new Error('Goal not found');

  const newNote = {
    id: String(Math.random()),
    text: data.text,
    createdBy: '1', // Replace with actual user ID
    createdAt: new Date().toISOString(),
  };

  const updatedGoal = {
    ...goals[index],
    notes: [...goals[index].notes, newNote],
    updated: new Date().toISOString(),
  };

  goals = [
    ...goals.slice(0, index),
    updatedGoal,
    ...goals.slice(index + 1),
  ];

  return updatedGoal;
}

export function useGoals(athleteId: string) {
  return useQuery({
    queryKey: ['goals', athleteId],
    queryFn: () => getGoals(athleteId),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createGoal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['goals', variables.athleteId],
      });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalData> }) =>
      updateGoal(id, data),
    onSuccess: (goal) => {
      queryClient.invalidateQueries({
        queryKey: ['goals', goal.athleteId],
      });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['goals'],
      });
    },
  });
}

export function useCreateGoalNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: CreateGoalNoteData }) =>
      addGoalNote(goalId, data),
    onSuccess: (goal) => {
      queryClient.invalidateQueries({
        queryKey: ['goals', goal.athleteId],
      });
    },
  });
}