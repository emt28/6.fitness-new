import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useCreateAssessment } from '@/hooks/use-assessments';
import { useProtocols } from '@/hooks/use-protocols';
import { assessmentSchema } from '@/types/assessment';
import { format } from 'date-fns';
import { z } from 'zod';

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  athleteId: string;
  onSuccess?: () => void;
}

export function AssessmentForm({ athleteId, onSuccess }: AssessmentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const createAssessment = useCreateAssessment();
  const { data: protocols } = useProtocols();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      athleteId,
      assessedAt: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const assessedAt = watch('assessedAt');

  const onSubmit = async (data: AssessmentFormData) => {
    try {
      setError(null);
      await createAssessment.mutateAsync(data);
      reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record assessment');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Assessment</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('athleteId')} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Date
          </label>
          <DatePicker
            date={assessedAt ? new Date(assessedAt) : undefined}
            onChange={(date) => date && setValue('assessedAt', format(date, 'yyyy-MM-dd'))}
            maxDate={new Date()}
          />
          {errors.assessedAt && (
            <p className="mt-1 text-sm text-red-600">{errors.assessedAt.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="protocolId" className="block text-sm font-medium text-gray-700">
            Test Protocol
          </label>
          <select
            {...register('protocolId')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a protocol</option>
            {protocols?.map((protocol) => (
              <option key={protocol.id} value={protocol.id}>
                {protocol.name} ({protocol.unit})
              </option>
            ))}
          </select>
          {errors.protocolId && (
            <p className="mt-1 text-sm text-red-600">{errors.protocolId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700">
            Result
          </label>
          <input
            {...register('value', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording...
            </>
          ) : (
            'Record Assessment'
          )}
        </Button>
      </form>
    </div>
  );
}