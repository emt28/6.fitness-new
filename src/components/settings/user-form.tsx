import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '@/hooks/use-users';
import { User, UserRole } from '@/types/auth';
import { Athlete } from '@/types/athlete';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'lead_coach', 'academy_coach', 'fitness_trainer', 'parent']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  assignments: z.array(z.object({
    athleteId: z.string(),
    role: z.enum(['coach', 'parent', 'fitness_trainer']),
  })),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User | null;
  athletes: Athlete[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'lead_coach', label: 'Lead Coach' },
  { value: 'academy_coach', label: 'Academy Coach' },
  { value: 'fitness_trainer', label: 'Fitness Trainer' },
  { value: 'parent', label: 'Parent' },
];

const ASSIGNMENT_ROLE_OPTIONS = [
  { value: 'coach', label: 'Coach' },
  { value: 'parent', label: 'Parent' },
  { value: 'fitness_trainer', label: 'Fitness Trainer' },
];

export function UserForm({ user, athletes, onSuccess, onCancel }: UserFormProps) {
  const [error, setError] = useState<string | null>(null);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      role: user.role,
      assignments: user.assignments || [],
      isActive: user.isActive ?? true,
    } : {
      assignments: [],
      isActive: true,
    },
  });

  const selectedRole = watch('role');
  const assignments = watch('assignments') || [];

  const handleAthleteAssignment = (athleteId: string, checked: boolean) => {
    const currentAssignments = assignments;
    if (checked) {
      setValue('assignments', [...currentAssignments, { athleteId, role: 'coach' }]);
    } else {
      setValue('assignments', currentAssignments.filter(a => a.athleteId !== athleteId));
    }
  };

  const handleAssignmentRoleChange = (athleteId: string, role: 'coach' | 'parent' | 'fitness_trainer') => {
    const currentAssignments = assignments;
    const index = currentAssignments.findIndex(a => a.athleteId === athleteId);
    if (index >= 0) {
      const newAssignments = [...currentAssignments];
      newAssignments[index] = { ...newAssignments[index], role };
      setValue('assignments', newAssignments);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setError(null);
      if (user) {
        await updateUser.mutateAsync({ id: user.id, data });
      } else {
        await createUser.mutateAsync(data);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
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
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          System Role
        </label>
        <Select
          options={ROLE_OPTIONS}
          value={selectedRole || ''}
          onChange={(value) => setValue('role', value as UserRole)}
          placeholder="Select a role"
        />
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Athlete Assignments
        </label>
        <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
          {athletes.map((athlete) => {
            const assignment = assignments.find(a => a.athleteId === athlete.id);
            return (
              <div key={athlete.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={!!assignment}
                    onCheckedChange={(checked) => handleAthleteAssignment(athlete.id, checked as boolean)}
                  />
                  <span className="text-sm text-gray-700">{athlete.name}</span>
                </div>
                
                {assignment && (
                  <Select
                    options={ASSIGNMENT_ROLE_OPTIONS}
                    value={assignment.role}
                    onChange={(value) => handleAssignmentRoleChange(athlete.id, value as 'coach' | 'parent' | 'fitness_trainer')}
                    placeholder="Select role"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          {...register('isActive')}
          id="isActive"
        />
        <label
          htmlFor="isActive"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Account Active
        </label>
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
              {user ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            user ? 'Update User' : 'Create User'
          )}
        </Button>
      </div>
    </form>
  );
}