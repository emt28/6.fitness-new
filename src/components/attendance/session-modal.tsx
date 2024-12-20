import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { useAthletes } from '@/hooks/use-athletes';
import { useCreateSession, useTemplates } from '@/hooks/use-attendance';

const sessionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  maxAthletes: z.number().min(1).max(20),
  selectedAthletes: z.array(z.string()).min(1, 'At least one athlete must be selected'),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionModalProps {
  date: Date;
  onClose: () => void;
}

export function SessionModal({ date, onClose }: SessionModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { data: athletes, isLoading: athletesLoading } = useAthletes();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const createSession = useCreateSession();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      startTime: '09:00',
      endTime: '10:00',
      maxAthletes: 10,
      selectedAthletes: [],
    },
  });

  const maxAthletes = watch('maxAthletes');
  const selectedAthletes = watch('selectedAthletes');

  // Handle template selection
  useEffect(() => {
    if (selectedTemplate && templates) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        // Find the first session from the template
        const session = template.sessions[0];
        if (session) {
          setValue('name', session.name);
          setValue('startTime', session.startTime);
          setValue('endTime', session.endTime);
          setValue('maxAthletes', session.maxAthletes);
          setValue('selectedAthletes', session.selectedAthletes || []);
        }
      }
    }
  }, [selectedTemplate, templates, setValue]);

  const onSubmit = async (data: SessionFormData) => {
    try {
      setError(null);
      await createSession.mutateAsync({
        ...data,
        date: format(date, 'yyyy-MM-dd'),
        dayOfWeek: date.getDay(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Session for {format(date, 'MMMM d, yyyy')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Use Template (Optional)
              </label>
              <Select
                options={templates?.map(t => ({ value: t.id, label: t.name })) || []}
                value={selectedTemplate}
                onChange={setSelectedTemplate}
                placeholder="Choose a template..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Selecting a template will pre-fill the session details
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Session Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  {...register('startTime')}
                  type="time"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  {...register('endTime')}
                  type="time"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Athletes
              </label>
              <input
                {...register('maxAthletes', { valueAsNumber: true })}
                type="number"
                min="1"
                max="20"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
              {errors.maxAthletes && (
                <p className="mt-1 text-sm text-red-600">{errors.maxAthletes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Athletes
              </label>
              <Select
                options={athletes?.map(a => ({ value: a.id, label: a.name })) || []}
                value={selectedAthletes}
                onChange={(value) => {
                  if (value.length <= maxAthletes) {
                    setValue('selectedAthletes', value);
                  }
                }}
                isMulti
                maxItems={maxAthletes}
                placeholder="Choose athletes..."
              />
              {errors.selectedAthletes && (
                <p className="mt-1 text-sm text-red-600">{errors.selectedAthletes.message}</p>
              )}
              {selectedAthletes.length > maxAthletes && (
                <p className="mt-1 text-sm text-red-600">
                  Cannot select more than {maxAthletes} athletes
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Session'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}