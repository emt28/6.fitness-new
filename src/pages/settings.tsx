import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/settings/user-management';
import { AccountSettings } from '@/components/settings/account-settings';
import { AuditLog } from '@/components/settings/audit-log';
import { usePermissions } from '@/hooks/use-permissions';
import { ErrorBoundary } from '@/components/settings/error-boundary';

export function SettingsPage() {
  const { can } = usePermissions();
  const isAdmin = can('manage_users');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <ErrorBoundary>
        <Tabs defaultValue="user-management" className="space-y-6">
          <TabsList>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            {isAdmin && <TabsTrigger value="audit">Audit Log</TabsTrigger>}
          </TabsList>

          <TabsContent value="user-management">
            <UserManagement />
          </TabsContent>

          <TabsContent value="account">
            <AccountSettings />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="audit">
              <AuditLog />
            </TabsContent>
          )}
        </Tabs>
      </ErrorBoundary>
    </div>
  );
}