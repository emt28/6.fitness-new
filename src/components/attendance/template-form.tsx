import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2, AlertCircle, Plus, Trash2, Calendar } from 'lucide-react';
import { useCreateTemplate } from '@/hooks/use-attendance';
import { useAthletes } from '@/hooks/use-athletes';
import { SessionTemplate } from '@/types/attendance';
import { format } from 'date-fns';

const sessionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  maxAthletes: z.number().min(1).max(20),
  selectedAthletes: z.array(z.string()).optional(),
  excludedDates: z.array(z.string()).optional(), // Array of dates when session won't run
});

const templateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sessions: z.array(sessionSchema).min(1, 'At least one session is required'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  template?: SessionTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TemplateForm({ template, onSuccess, onCancel }: TemplateFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const createTemplate = useCreateTemplate();
  const { data: athletes, isLoading: athletesLoading } = useAthletes();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      name: template.name,
      description: template.description,
      sessions: template.sessions.map(s => ({
        name: s.name,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        maxAthletes: s.maxAthletes,
        selectedAthletes: s.selectedAthletes || [],
        excludedDates: [],
      })),
    } : {
      sessions: [{
        name: '',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        maxAthletes: 10,
        selectedAthletes: [],
        excludedDates: [],
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sessions',
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setError(null);
      setSuccess(false);
      await createTemplate.mutateAsync(data);
      setSuccess(true);
      reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    }
  };

  const weekDays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center text-green-600">
          <span>Template created successfully!</span>
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
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Sessions</h3>
          <Button
            type="button"
            onClick={() => append({
              name: '',
              dayOfWeek: 1,
              startTime: '09:00',
              endTime: '10:00',
              maxAthletes: 10,
              selectedAthletes: [],
              excludedDates: [],
            })}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Session
          </Button>
        </div>

        {fields.map((field, index) => {
          const maxAthletes = watch(`sessions.${index}.maxAthletes`);
          const selectedAthletes = watch(`sessions.${index}.selectedAthletes`) || [];
          const excludedDates = watch(`sessions.${index}.excludedDates`) || [];

          return (
            <div
              key={field.id}
              className="p-4 border rounded-lg bg-gray-50 space-y-4"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-900">
                  Session {index + 1}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Session Name
                  </label>
                  <input
                    {...register(`sessions.${index}.name`)}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Day of Week
                  </label>
                  <select
                    {...register(`sessions.${index}.dayOfWeek`, { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    {weekDays.map((day, i) => (
                      <option key={i} value={i}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    {...register(`sessions.${index}.startTime`)}
                    type="time"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    {...register(`sessions.${index}.endTime`)}
                    type="time"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Athletes
                  </label>
                  <input
                    {...register(`sessions.${index}.maxAthletes`, { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="20"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
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
                        setValue(`sessions.${index}.selectedAthletes`, value);
                      }
                    }}
                    isMulti
                    maxItems={maxAthletes}
                    placeholder="Choose athletes..."
                  />
                  {selectedAthletes.length > maxAthletes && (
                    <p className="mt-1 text-sm text-red-600">
                      Cannot select more than {maxAthletes} athletes
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Excluded Dates
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="date"
                      min={format(new Date(), 'yyyy-MM-dd')}
                      onChange={(e) => {
                        const date = e.target.value;
                        if (date && !excludedDates.includes(date)) {
                          setValue(`sessions.${index}.excludedDates`, [...excludedDates, date]);
                        }
                      }}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  {excludedDates.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Excluded dates:</p>
                      <div className="flex flex-wrap gap-2">
                        {excludedDates.map((date) => (
                          <span
                            key={date}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-700"
                          >
                            {format(new Date(date), 'MMM d, yyyy')}
                            <button
                              type="button"
                              onClick={() => {
                                setValue(
                                  `sessions.${index}.excludedDates`,
                                  excludedDates.filter(d => d !== date)
                                );
                              }}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {errors.sessions && (
          <p className="mt-1 text-sm text-red-600">{errors.sessions.message}</p>
        )}
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
              {template ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            template ? 'Update Template' : 'Create Template'
          )}
        </Button>
      </div>
    </form>
  );
}