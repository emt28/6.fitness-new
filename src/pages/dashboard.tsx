import { useAuth } from '@/contexts/auth-context';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { CoachDashboard } from '@/components/dashboard/coach-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { ParentDashboard } from '@/components/dashboard/parent-dashboard';
import { Loader2 } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {user?.role === 'parent' 
            ? "Here's an overview of your athlete's performance and activities."
            : "Here's an overview of your athletes' performance and recent activities."}
        </p>
      </div>

      {user?.role === 'admin' ? (
        <AdminDashboard stats={stats} />
      ) : user?.role === 'parent' ? (
        <ParentDashboard />
      ) : (
        <CoachDashboard stats={stats} />
      )}
    </div>
  );
}