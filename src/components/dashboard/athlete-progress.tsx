import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { DashboardStats } from '@/types/dashboard';

interface AthleteProgressProps {
  stats: DashboardStats;
  protocolId: string;
  dateRange: '1w' | '1m' | '3m' | '6m';
}

export function AthleteProgress({ stats, protocolId, dateRange }: AthleteProgressProps) {
  const protocol = stats.protocols.find(p => p.id === protocolId);
  
  if (!protocol) {
    return (
      <div className="text-gray-500 text-center py-12">
        Select a protocol to view progress
      </div>
    );
  }

  const chartData = stats.recentAssessments
    .filter(a => a.protocolId === protocolId)
    .map(assessment => ({
      date: format(new Date(assessment.assessedAt), 'MMM d, yyyy'),
      value: assessment.value,
      level: assessment.performanceLevel,
    }));

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            label={{
              value: protocol.unit,
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{
              stroke: '#3b82f6',
              strokeWidth: 2,
              r: 4,
              fill: '#fff',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}