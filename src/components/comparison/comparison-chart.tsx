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
import { Assessment } from '@/types/assessment';
import { TestProtocol } from '@/types/protocol';
import { Athlete } from '@/types/athlete';

interface ComparisonChartProps {
  data: Array<{
    athlete: Athlete | undefined;
    assessments: Assessment[];
  }>;
  protocol: TestProtocol | undefined;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export function ComparisonChart({ data, protocol }: ComparisonChartProps) {
  if (!protocol || data.length === 0) {
    return null;
  }

  const chartData = data[0].assessments.map(assessment => {
    const point: any = {
      date: format(new Date(assessment.assessedAt), 'MMM d, yyyy'),
    };

    data.forEach(({ athlete, assessments }) => {
      if (athlete) {
        const matchingAssessment = assessments.find(
          a => format(new Date(a.assessedAt), 'MMM d, yyyy') === point.date
        );
        point[athlete.name] = matchingAssessment?.value;
      }
    });

    return point;
  });

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
          {data.map(({ athlete }, index) => {
            if (!athlete) return null;
            return (
              <Line
                key={athlete.id}
                type="monotone"
                dataKey={athlete.name}
                stroke={COLORS[index]}
                strokeWidth={2}
                dot={{
                  stroke: COLORS[index],
                  strokeWidth: 2,
                  r: 4,
                  fill: '#fff',
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}