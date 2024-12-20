import { DashboardStats } from '@/types/dashboard';
import { ActivityMetrics } from './activity-metrics';
import { UserActivity } from './user-activity';
import { SystemOverview } from './system-overview';

interface AdminDashboardProps {
  stats: DashboardStats;
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SystemOverview stats={stats} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Assessment Activity
          </h2>
          <ActivityMetrics stats={stats} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            User Activity
          </h2>
          <UserActivity stats={stats} />
        </div>
      </div>
    </div>
  );
}