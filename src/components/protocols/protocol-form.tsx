import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useCreateProtocol, useUpdateProtocol } from '@/hooks/use-protocols';
import { TestProtocol, PROTOCOL_CATEGORIES, ProtocolCategory } from '@/types/protocol';

const normativeRangeSchema = z.object({
  ageGroup: z.enum(['U10', 'U12', 'U14', 'U16', 'U18', 'College'] as const),
  needs_improvement: z.object({
    min: z.number(),
    max: z.number(),
  }),
  median: z.object({
    min: z.number(),
    max: z.number(),
  }),
  excellent: z.object({
    min: z.number(),
    max: z.number(),
  }),
});

const protocolSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  unit: z.string().min(1, 'Unit is required'),
  criteria: z.enum(['lower', 'higher'] as const),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  normativeData: z.array(normativeRangeSchema)
    .min(1, 'At least one age group is required'),
});

type ProtocolFormData = z.infer<typeof protocolSchema>;

const AGE_GROUPS = ['U10', 'U12', 'U14', 'U16', 'U18', 'College'];
const CRITERIA = ['lower', 'higher'];

interface ProtocolFormProps {
  protocol?: TestProtocol;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProtocolForm({ protocol, onSuccess, onCancel }: ProtocolFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const createProtocol = useCreateProtocol();
  const updateProtocol = useUpdateProtocol();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProtocolFormData>({
    resolver: zodResolver(protocolSchema),
    defaultValues: protocol ? {
      name: protocol.name,
      description: protocol.description,
      unit: protocol.unit,
      criteria: protocol.criteria,
      categories: protocol.categories,
      normativeData: protocol.normativeData,
    } : {
      categories: [],
      normativeData: [
        {
          ageGroup: 'U12',
          needs_improvement: { min: 0, max: 0 },
          median: { min: 0, max: 0 },
          excellent: { min: 0, max: 0 },
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'normativeData',
  });

  const selectedCategories = watch('categories');

  const onSubmit = async (data: ProtocolFormData) => {
    try {
      setError(null);
      setSuccess(false);
      
      if (protocol) {
        await updateProtocol.mutateAsync({ id: protocol.id, data });
      } else {
        await createProtocol.mutateAsync(data);
      }
      
      setSuccess(true);
      if (!protocol) reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save protocol');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {protocol ? 'Edit Test Protocol' : 'Create New Test Protocol'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          Protocol {protocol ? 'updated' : 'created'} successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Test Name
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
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit of Measure
            </label>
            <input
              {...register('unit')}
              type="text"
              placeholder="e.g., seconds, meters, kg"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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

        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
            Categories
          </label>
          <Select
            options={PROTOCOL_CATEGORIES}
            value={selectedCategories}
            onChange={(value) => setValue('categories', value)}
            isMulti
            placeholder="Select categories..."
          />
          {errors.categories && (
            <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="criteria" className="block text-sm font-medium text-gray-700">
            Performance Criteria
          </label>
          <select
            {...register('criteria')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {CRITERIA.map((criteria) => (
              <option key={criteria} value={criteria}>
                {criteria === 'lower' ? 'Lower is better' : 'Higher is better'}
              </option>
            ))}
          </select>
          {errors.criteria && (
            <p className="mt-1 text-sm text-red-600">{errors.criteria.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Normative Data</h3>
            <Button
              type="button"
              onClick={() => append({
                ageGroup: 'U12',
                needs_improvement: { min: 0, max: 0 },
                median: { min: 0, max: 0 },
                excellent: { min: 0, max: 0 },
              })}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Age Group
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <select
                    {...register(`normativeData.${index}.ageGroup`)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    {AGE_GROUPS.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {['needs_improvement', 'median', 'excellent'].map((level) => (
                  <div key={level} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 capitalize">
                      {level.replace('_', ' ')}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Min</label>
                        <input
                          {...register(`normativeData.${index}.${level}.min` as const, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          step="0.1"
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Max</label>
                        <input
                          {...register(`normativeData.${index}.${level}.max` as const, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          step="0.1"
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {errors.normativeData && (
            <p className="mt-1 text-sm text-red-600">{errors.normativeData.message}</p>
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
            className="flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {protocol ? 'Updating Protocol...' : 'Creating Protocol...'}
              </>
            ) : (
              protocol ? 'Update Protocol' : 'Create Protocol'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}