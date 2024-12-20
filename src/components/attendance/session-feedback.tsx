import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSessionFeedback } from '@/hooks/use-feedback';
import { CustomFeedbackElements } from './custom-feedback-elements';
import { FitnessSession } from '@/types/attendance';
import { SessionFeedback, FeedbackTemplate } from '@/types/feedback';

const feedbackSchema = z.object({
  mainFocus: z.string().min(1, 'Main focus is required'),
  secondaryGoals: z.array(z.string()),
  drills: z.array(z.string()),
  notes: z.string(),
  media: z.array(z.string()).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

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

interface SessionFeedbackFormProps {
  session: FitnessSession;
  existingFeedback?: SessionFeedback;
  onSuccess?: () => void;
  templates: FeedbackTemplate[];
}

export function SessionFeedbackForm({
  session,
  existingFeedback,
  onSuccess,
  templates,
}: SessionFeedbackFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { createFeedback, updateFeedback } = useSessionFeedback();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: existingFeedback ? {
      mainFocus: existingFeedback.mainFocus,
      secondaryGoals: existingFeedback.secondaryGoals,
      drills: existingFeedback.drills,
      notes: existingFeedback.notes,
      media: existingFeedback.media,
    } : {
      secondaryGoals: [],
      drills: [],
      notes: '',
      media: [],
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setValue('mainFocus', template.mainFocus);
      setValue('secondaryGoals', template.secondaryGoals);
      setValue('drills', template.drills);
      setValue('notes', template.notes);
    }
    setSelectedTemplate(templateId);
  };

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setError(null);
      if (existingFeedback) {
        await updateFeedback.mutateAsync({
          id: existingFeedback.id,
          data,
        });
      } else {
        await createFeedback.mutateAsync({
          sessionId: session.id,
          ...data,
        });
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feedback');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Use Template (Optional)
          </label>
          <Select
            options={templates.map(t => ({ value: t.id, label: t.name }))}
            value={selectedTemplate}
            onChange={handleTemplateSelect}
            placeholder="Choose a template..."
          />
        </div>
      )}

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
        <CustomFeedbackElements
          type="focus"
          onSelect={(value) => setValue('mainFocus', value)}
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
        <CustomFeedbackElements
          type="goals"
          onSelect={(value) => {
            const current = watch('secondaryGoals') || [];
            if (!current.includes(value)) {
              setValue('secondaryGoals', [...current, value]);
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Drills Performed
        </label>
        <Select
          options={DRILL_OPTIONS}
          value={watch('drills')}
          onChange={(value) => setValue('drills', value)}
          isMulti
          placeholder="Select drills..."
        />
        <CustomFeedbackElements
          type="drills"
          onSelect={(value) => {
            const current = watch('drills') || [];
            if (!current.includes(value)) {
              setValue('drills', [...current, value]);
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="Add any notes or observations..."
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Feedback'
          )}
        </Button>
      </div>
    </form>
  );
}