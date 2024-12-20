import { DashboardStats } from '@/types/dashboard';
import { Users, ClipboardList, FileText } from 'lucide-react';

interface SystemOverviewProps {
  stats: DashboardStats;
}

export function SystemOverview({ stats }: SystemOverviewProps) {
  const cards = [
    {
      title: 'Total Athletes',
      value: stats.totalAthletes,
      trend: '+12%',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Assessments',
      value: stats.totalAssessments,
      trend: `+${stats.assessmentsTrend}%`,
      icon: ClipboardList,
      color: 'green',
    },
    {
      title: 'Active Templates',
      value: stats.templateUsage.length,
      trend: '+5%',
      icon: FileText,
      color: 'purple',
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
        >
          <dt>
            <div className={`absolute rounded-md bg-${card.color}-500 p-3`}>
              <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {card.title}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
            <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
              {card.trend}
            </p>
          </dd>
        </div>
      ))}
    </>
  );
}