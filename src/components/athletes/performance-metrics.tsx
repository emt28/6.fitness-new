import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  Label,
} from 'recharts';
import { format } from 'date-fns';
import { Assessment } from '@/types/assessment';
import { TestProtocol } from '@/types/protocol';
import { AttendanceStats } from '@/types/attendance';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PerformanceMetricsProps {
  assessments: Assessment[];
  protocols: TestProtocol[];
  attendanceStats?: AttendanceStats;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
const PERFORMANCE_COLORS = {
  excellent: '#22c55e',
  median: '#eab308',
  needs_improvement: '#ef4444',
};

export function PerformanceMetrics({ assessments, protocols, attendanceStats }: PerformanceMetricsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);

  // Calculate date range for filtering
  const dateLimit = useMemo(() => {
    const date = new Date();
    switch (selectedTimeframe) {
      case '1m': date.setMonth(date.getMonth() - 1); break;
      case '3m': date.setMonth(date.getMonth() - 3); break;
      case '6m': date.setMonth(date.getMonth() - 6); break;
      case '1y': date.setFullYear(date.getFullYear() - 1); break;
    }
    return date;
  }, [selectedTimeframe]);

  // Group and process assessments by protocol
  const assessmentsByProtocol = useMemo(() => {
    return protocols.reduce((acc, protocol) => {
      const protocolAssessments = assessments
        .filter(a => a.protocolId === protocol.id)
        .filter(a => new Date(a.assessedAt) >= dateLimit)
        .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime());

      if (protocolAssessments.length > 0) {
        // Calculate improvement percentage
        const firstValue = protocolAssessments[0].value;
        const lastValue = protocolAssessments[protocolAssessments.length - 1].value;
        const improvement = protocol.criteria === 'lower' 
          ? ((firstValue - lastValue) / firstValue) * 100
          : ((lastValue - firstValue) / firstValue) * 100;

        // Find best performance
        const bestValue = protocol.criteria === 'lower'
          ? Math.min(...protocolAssessments.map(a => a.value))
          : Math.max(...protocolAssessments.map(a => a.value));

        acc[protocol.id] = {
          protocol,
          data: protocolAssessments.map(a => ({
            date: format(new Date(a.assessedAt), 'MMM d, yyyy'),
            value: a.value,
            level: a.performanceLevel,
            notes: a.notes,
            isBest: a.value === bestValue,
          })),
          improvement,
          bestValue,
        };
      }
      return acc;
    }, {} as Record<string, {
      protocol: TestProtocol;
      data: any[];
      improvement: number;
      bestValue: number;
    }>);
  }, [protocols, assessments, dateLimit]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="mt-1">
            <p className="text-sm">
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              {' '}{entry.value} {entry.payload.unit}
            </p>
            {entry.payload.notes && (
              <p className="text-xs text-gray-500 mt-1">
                Note: {entry.payload.notes}
              </p>
            )}
            {entry.payload.isBest && (
              <p className="text-xs text-green-600 font-medium mt-1">
                Best Performance! 🏆
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const CustomDot = ({ cx, cy, payload }: any) => {
    if (!cx || !cy) return null;

    const size = payload.isBest ? 8 : 6;
    const color = PERFORMANCE_COLORS[payload.level as keyof typeof PERFORMANCE_COLORS];

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={size}
          fill="white"
          stroke={color}
          strokeWidth={2}
        />
        {payload.isBest && (
          <circle
            cx={cx}
            cy={cy}
            r={12}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}
      </g>
    );
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          {(['1m', '3m', '6m', '1y'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              size="sm"
              variant={selectedTimeframe === timeframe ? 'primary' : 'outline'}
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe === '1m' ? '1 Month' :
               timeframe === '3m' ? '3 Months' :
               timeframe === '6m' ? '6 Months' :
               '1 Year'}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant={showComparison ? 'primary' : 'outline'}
          onClick={() => setShowComparison(!showComparison)}
        >
          {showComparison ? 'Hide Comparison' : 'Compare Metrics'}
        </Button>
      </div>

      {/* Performance Metrics */}
      {showComparison ? (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-4 space-y-2">
            <h4 className="text-lg font-medium text-gray-900">Compare Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(assessmentsByProtocol).map(([id, { protocol }]) => (
                <Button
                  key={id}
                  size="sm"
                  variant={selectedProtocols.includes(id) ? 'primary' : 'outline'}
                  onClick={() => {
                    setSelectedProtocols(prev => 
                      prev.includes(id) 
                        ? prev.filter(p => p !== id)
                        : [...prev, id]
                    );
                  }}
                >
                  {protocol.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  type="category"
                  allowDuplicatedCategory={false}
                />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {selectedProtocols.map((protocolId, index) => {
                  const { protocol, data } = assessmentsByProtocol[protocolId];
                  return (
                    <Line
                      key={protocol.id}
                      yAxisId={index === 0 ? 'left' : 'right'}
                      type="monotone"
                      data={data}
                      dataKey="value"
                      name={`${protocol.name} (${protocol.unit})`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={<CustomDot />}
                      activeDot={{ r: 8 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(assessmentsByProtocol).map(([id, { protocol, data, improvement, bestValue }]) => (
            <div key={id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{protocol.name}</h4>
                  <p className="text-sm text-gray-500">Performance Over Time</p>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-sm font-medium",
                    improvement > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {improvement > 0 ? "+" : ""}{improvement.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Best: {bestValue} {protocol.unit}
                  </div>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis>
                      <Label
                        value={protocol.unit}
                        angle={-90}
                        position="insideLeft"
                        style={{ textAnchor: 'middle' }}
                      />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={protocol.name}
                      stroke={COLORS[0]}
                      strokeWidth={2}
                      dot={<CustomDot />}
                      activeDot={{ r: 8 }}
                    />
                    <ReferenceLine
                      y={bestValue}
                      stroke={COLORS[0]}
                      strokeDasharray="3 3"
                      label={{
                        value: `Best: ${bestValue}`,
                        position: 'right',
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Distribution</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  name: 'Excellent',
                  value: assessments.filter(a => a.performanceLevel === 'excellent').length,
                  color: PERFORMANCE_COLORS.excellent,
                },
                {
                  name: 'Median',
                  value: assessments.filter(a => a.performanceLevel === 'median').length,
                  color: PERFORMANCE_COLORS.median,
                },
                {
                  name: 'Needs Improvement',
                  value: assessments.filter(a => a.performanceLevel === 'needs_improvement').length,
                  color: PERFORMANCE_COLORS.needs_improvement,
                },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="value"
                name="Number of Assessments"
              >
                {data => data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}