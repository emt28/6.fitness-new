import { useState } from 'react';
import { DashboardStats } from '@/types/dashboard';
import { CoachOverview } from './coach-overview';
import { PerformanceOverview } from './performance-overview';
import { AthleteProgress } from './athlete-progress';
import { RecentActivity } from './recent-activity';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CoachDashboardProps {
  stats: DashboardStats;
}

export function CoachDashboard({ stats }: CoachDashboardProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [dateRange, setDateRange] = useState<'1w' | '1m' | '3m' | '6m'>('1m');

  return (
    <div className="space-y-6">
      <CoachOverview stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Performance Distribution
          </h2>
          <PerformanceOverview stats={stats} />
        </div>

        <RecentActivity activities={stats.recentActivities} />
      </div>
    </div>
  );
}