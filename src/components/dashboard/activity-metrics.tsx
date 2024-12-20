import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DashboardStats } from '@/types/dashboard';

interface ActivityMetricsProps {
  stats: DashboardStats;
}

export function ActivityMetrics({ stats }: ActivityMetricsProps) {
  const data = [
    {
      name: 'Excellent',
      value: stats.performanceDistribution.excellent,
    },
    {
      name: 'Median',
      value: stats.performanceDistribution.median,
    },
    {
      name: 'Needs Improvement',
      value: stats.performanceDistribution.needsImprovement,
    },
  ];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" name="Number of Assessments" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}