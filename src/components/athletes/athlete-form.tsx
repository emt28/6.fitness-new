import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateAthlete, useUpdateAthlete } from '@/hooks/use-athletes';
import { calculateAge } from '@/lib/utils';
import { Athlete } from '@/types/athlete';

const athleteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().refine((date) => {
    const age = calculateAge(date);
    return age >= 4 && age <= 80;
  }, 'Athlete must be between 4 and 80 years old'),
  dominantHand: z.enum(['left', 'right', 'ambidextrous']),
  wtn: z.number()
    .min(1, 'WTN must be between 1 and 40')
    .max(40, 'WTN must be between 1 and 40'),
});

type AthleteFormData = z.infer<typeof athleteSchema>;

interface AthleteFormProps {
  athlete?: Athlete;
  onSuccess?: () => void;
}

export function AthleteForm({ athlete, onSuccess }: AthleteFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const createAthlete = useCreateAthlete();
  const updateAthlete = useUpdateAthlete();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AthleteFormData>({
    resolver: zodResolver(athleteSchema),
    defaultValues: athlete ? {
      name: athlete.name,
      dateOfBirth: athlete.dateOfBirth,
      dominantHand: athlete.dominantHand,
      wtn: athlete.wtn,
    } : undefined,
  });

  const dateOfBirth = watch('dateOfBirth');
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

  const onSubmit = async (data: AthleteFormData) => {
    try {
      setError(null);
      setSuccess(false);
      
      if (athlete) {
        await updateAthlete.mutateAsync({ id: athlete.id, data });
      } else {
        await createAthlete.mutateAsync(data);
      }
      
      setSuccess(true);
      if (!athlete) reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save athlete');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {athlete ? 'Edit Athlete' : 'Register New Athlete'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          {athlete ? 'Athlete updated successfully!' : 'Athlete registered successfully!'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
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
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {age !== null && (
            <p className="mt-1 text-sm text-gray-500">Age: {age} years</p>
          )}
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dominantHand" className="block text-sm font-medium text-gray-700">
            Dominant Hand
          </label>
          <select
            {...register('dominantHand')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select dominant hand</option>
            <option value="right">Right</option>
            <option value="left">Left</option>
            <option value="ambidextrous">Ambidextrous</option>
          </select>
          {errors.dominantHand && (
            <p className="mt-1 text-sm text-red-600">{errors.dominantHand.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="wtn" className="block text-sm font-medium text-gray-700">
            World Tennis Number (WTN)
          </label>
          <input
            {...register('wtn', { valueAsNumber: true })}
            type="number"
            min="1"
            max="40"
            step="0.1"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {errors.wtn && (
            <p className="mt-1 text-sm text-red-600">{errors.wtn.message}</p>
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
              {athlete ? 'Updating...' : 'Registering...'}
            </>
          ) : (
            athlete ? 'Update Athlete' : 'Register Athlete'
          )}
        </Button>
      </form>
    </div>
  );
}