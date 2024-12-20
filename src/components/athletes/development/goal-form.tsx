import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { useProtocols } from '@/hooks/use-protocols';
import { useSessions } from '@/hooks/use-attendance';
import { useCreateGoal, useUpdateGoal } from '@/hooks/use-goals';
import { useUsers } from '@/hooks/use-users';
import { goalSchema, CreateGoalData, DevelopmentGoal } from '@/types/development';
import { format, addMonths } from 'date-fns';

interface GoalFormProps {
  athleteId: string;
  goal?: DevelopmentGoal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: 'physical', label: 'Physical' },
  { value: 'tactical', label: 'Tactical' },
  { value: 'technical', label: 'Technical' },
  { value: 'mental', label: 'Mental' },
  { value: 'other', label: 'Other' },
];

export function GoalForm({ athleteId, goal, onSuccess, onCancel }: GoalFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { data: protocols } = useProtocols();
  const { data: sessions } = useSessions();
  const { data: users } = useUsers();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateGoalData>({
    resolver: zodResolver(goalSchema),
    defaultValues: goal ? {
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetMetric: goal.targetMetric,
      deadline: goal.deadline,
      protocolId: goal.protocolId,
      linkedSessions: goal.linkedSessions,
      assignedTo: goal.assignedTo,
    } : {
      deadline: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
      linkedSessions: [],
    },
  });

  const selectedCategory = watch('category');
  const showMetrics = selectedCategory !== 'other';

  const onSubmit = async (data: CreateGoalData) => {
    try {
      setError(null);
      // Remove targetMetric if empty values
      if (data.targetMetric && (!data.targetMetric.value || !data.targetMetric.unit)) {
        delete data.targetMetric;
      }
      if (goal) {
        await updateGoal.mutateAsync({ id: goal.id, data });
      } else {
        await createGoal.mutateAsync({ ...data, athleteId });
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    }
  };

  const coaches = users?.filter(user => 
    ['lead_coach', 'academy_coach', 'fitness_trainer'].includes(user.role)
  ) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Goal Title
        </label>
        <input
          {...register('title')}
          type="text"
          placeholder="e.g., Improve 20m Sprint Time"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Describe the goal and any specific requirements..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <Select
            options={CATEGORIES}
            value={selectedCategory}
            onChange={(value) => setValue('category', value as any)}
            placeholder="Select category..."
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Deadline
          </label>
          <input
            {...register('deadline')}
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
          )}
        </div>
      </div>

      {showMetrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Value (Optional)
            </label>
            <input
              {...register('targetMetric.value', { 
                setValueAs: v => v === '' ? undefined : Number(v),
                valueAsNumber: true 
              })}
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unit (Optional)
            </label>
            <input
              {...register('targetMetric.unit')}
              type="text"
              placeholder="e.g., seconds, meters"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Assigned To
        </label>
        <Select
          options={coaches.map(coach => ({
            value: coach.id,
            label: `${coach.name} (${coach.role.replace('_', ' ')})`
          }))}
          value={watch('assignedTo')}
          onChange={(value) => setValue('assignedTo', value)}
          placeholder="Select a coach..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Link to Protocol (Optional)
        </label>
        <Select
          options={protocols?.map(p => ({ value: p.id, label: p.name })) || []}
          value={watch('protocolId')}
          onChange={(value) => setValue('protocolId', value)}
          placeholder="Select a protocol..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Link to Training Sessions (Optional)
        </label>
        <Select
          options={sessions?.map(s => ({
            value: s.id,
            label: `${s.name} - ${format(new Date(s.date), 'MMM d, yyyy')}`,
          })) || []}
          value={watch('linkedSessions')}
          onChange={(value) => setValue('linkedSessions', value)}
          isMulti
          placeholder="Select sessions..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {goal ? 'Updating Goal...' : 'Creating Goal...'}
            </>
          ) : (
            goal ? 'Update Goal' : 'Create Goal'
          )}
        </Button>
      </div>
    </form>
  );
}