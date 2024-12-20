import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Loader2, Mail, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useUpdateUserPreferences, useUpdatePassword } from '@/hooks/use-users';

const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  reportUpdates: z.boolean(),
  attendanceAlerts: z.boolean(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function AccountSettings() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const updatePreferences = useUpdateUserPreferences();
  const updatePassword = useUpdatePassword();

  const {
    register: registerPreferences,
    handleSubmit: handlePreferencesSubmit,
    formState: { errors: preferencesErrors, isSubmitting: isPreferencesSubmitting },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      emailNotifications: true,
      reportUpdates: true,
      attendanceAlerts: true,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPreferencesSubmit = async (data: PreferencesFormData) => {
    try {
      setError(null);
      await updatePreferences.mutateAsync({
        userId: user!.id,
        preferences: data,
      });
      setSuccess('Preferences updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setError(null);
      await updatePassword.mutateAsync({
        userId: user!.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess('Password updated successfully');
      resetPassword();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h2>
        <form onSubmit={handlePreferencesSubmit(onPreferencesSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive email updates about your account</p>
                </div>
              </div>
              <Switch {...registerPreferences('emailNotifications')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Report Updates</label>
                  <p className="text-sm text-gray-500">Get notified when new reports are available</p>
                </div>
              </div>
              <Switch {...registerPreferences('reportUpdates')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Attendance Alerts</label>
                  <p className="text-sm text-gray-500">Receive alerts about attendance updates</p>
                </div>
              </div>
              <Switch {...registerPreferences('attendanceAlerts')} />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPreferencesSubmitting}
            className="flex items-center"
          >
            {isPreferencesSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Change Password</h2>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              {...registerPassword('currentPassword')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              {...registerPassword('newPassword')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              {...registerPassword('confirmPassword')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPasswordSubmitting}
            className="flex items-center"
          >
            {isPasswordSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}