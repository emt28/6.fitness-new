import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCreateFeedbackTemplate } from '@/hooks/use-feedback';

const templateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mainFocus: z.string().min(1, 'Main focus is required'),
  secondaryGoals: z.array(z.string()),
  drills: z.array(z.string()),
  notes: z.string(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

const FOCUS_OPTIONS = [
  'Forehand Technique',
  'Backhand Technique',
  'Serve Development',
  'Volley Practice',
  'Match Play',
  'Footwork',
  'Physical Conditioning',
  'Mental Training',
].map(focus => ({ value: focus, label: focus }));

const DRILL_OPTIONS = [
  'Baseline Rallies',
  'Serve Practice',
  'Volley Drills',
  'Approach Shots',
  'Return of Serve',
  'Point Play',
  'Ladder Drills',
  'Cone Drills',
].map(drill => ({ value: drill, label: drill }));

interface FeedbackTemplateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FeedbackTemplateForm({ onSuccess, onCancel }: FeedbackTemplateFormProps) {
  const [error, setError] = useState<string | null>(null);
  const createTemplate = useCreateFeedbackTemplate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      secondaryGoals: [],
      drills: [],
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setError(null);
      await createTemplate.mutateAsync(data);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Template Name
        </label>
        <input
          {...register('name')}
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., Basic Forehand Practice"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Main Focus
        </label>
        <Select
          options={FOCUS_OPTIONS}
          value={watch('mainFocus')}
          onChange={(value) => setValue('mainFocus', value)}
          placeholder="Select main focus..."
        />
        {errors.mainFocus && (
          <p className="mt-1 text-sm text-red-600">{errors.mainFocus.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Secondary Goals
        </label>
        <Select
          options={FOCUS_OPTIONS}
          value={watch('secondaryGoals')}
          onChange={(value) => setValue('secondaryGoals', value)}
          isMulti
          placeholder="Select secondary goals..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Common Drills
        </label>
        <Select
          options={DRILL_OPTIONS}
          value={watch('drills')}
          onChange={(value) => setValue('drills', value)}
          isMulti
          placeholder="Select drills..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Default Notes
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="Add any default notes or instructions..."
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
              Saving Template...
            </>
          ) : (
            'Save Template'
          )}
        </Button>
      </div>
    </form>
  );
}