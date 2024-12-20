import { useMemo } from 'react';
import { Assessment } from '@/types/assessment';
import { TestProtocol } from '@/types/protocol';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoricalComparisonProps {
  assessments: Assessment[];
  protocols: TestProtocol[];
  timeframe: '3m' | '6m' | '1y';
}

export function HistoricalComparison({
  assessments,
  protocols,
  timeframe,
}: HistoricalComparisonProps) {
  const comparisons = useMemo(() => {
    // Calculate date threshold based on timeframe
    const now = new Date();
    const threshold = new Date();
    switch (timeframe) {
      case '3m':
        threshold.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        threshold.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        threshold.setFullYear(now.getFullYear() - 1);
        break;
    }

    return protocols.map(protocol => {
      const protocolAssessments = assessments
        .filter(a => a.protocolId === protocol.id)
        .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime());

      if (protocolAssessments.length < 2) return null;

      // Find assessments within timeframe
      const periodAssessments = protocolAssessments.filter(
        a => new Date(a.assessedAt) >= threshold
      );

      if (periodAssessments.length < 2) return null;

      const first = periodAssessments[0];
      const latest = periodAssessments[periodAssessments.length - 1];
      
      // Calculate change percentage
      const change = protocol.criteria === 'lower'
        ? ((first.value - latest.value) / first.value) * 100
        : ((latest.value - first.value) / first.value) * 100;

      // Find personal best
      const personalBest = protocol.criteria === 'lower'
        ? Math.min(...protocolAssessments.map(a => a.value))
        : Math.max(...protocolAssessments.map(a => a.value));

      const personalBestDate = protocolAssessments.find(
        a => a.value === personalBest
      )?.assessedAt;

      // Calculate consistency score (0-100)
      const values = periodAssessments.map(a => a.value);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const consistency = Math.max(0, 100 - (variance / mean) * 100);

      return {
        protocol,
        change,
        improved: change > 0,
        personalBest,
        personalBestDate,
        consistency,
        latest: latest.value,
        assessmentCount: periodAssessments.length,
      };
    }).filter(Boolean);
  }, [assessments, protocols, timeframe]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
          Historical Progress
        </h3>
      </div>

      <div className="grid gap-4">
        {comparisons.map(comparison => (
          <div
            key={comparison.protocol.id}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">{comparison.protocol.name}</h4>
              <div className="flex items-center space-x-1">
                {comparison.improved ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  comparison.improved ? "text-green-600" : "text-red-600"
                )}>
                  {comparison.improved ? "+" : ""}{comparison.change.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Personal Best */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Award className="h-4 w-4 text-blue-500 mr-1" />
                  <h5 className="text-sm font-medium text-blue-800">Personal Best</h5>
                </div>
                <p className="text-sm text-blue-600">
                  {comparison.personalBest} {comparison.protocol.unit}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Achieved on {format(new Date(comparison.personalBestDate!), 'MMM d, yyyy')}
                </p>
              </div>

              {/* Consistency Score */}
              <div className={cn(
                "p-3 rounded-lg",
                comparison.consistency >= 80 ? "bg-green-50" :
                comparison.consistency >= 60 ? "bg-yellow-50" :
                "bg-red-50"
              )}>
                <div className="flex items-center mb-1">
                  <AlertCircle className={cn(
                    "h-4 w-4 mr-1",
                    comparison.consistency >= 80 ? "text-green-500" :
                    comparison.consistency >= 60 ? "text-yellow-500" :
                    "text-red-500"
                  )} />
                  <h5 className={cn(
                    "text-sm font-medium",
                    comparison.consistency >= 80 ? "text-green-800" :
                    comparison.consistency >= 60 ? "text-yellow-800" :
                    "text-red-800"
                  )}>Consistency Score</h5>
                </div>
                <p className={cn(
                  "text-sm",
                  comparison.consistency >= 80 ? "text-green-600" :
                  comparison.consistency >= 60 ? "text-yellow-600" :
                  "text-red-600"
                )}>
                  {comparison.consistency.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {comparison.assessmentCount} assessments
                </p>
              </div>
            </div>

            {/* Latest Result */}
            <div className="mt-4 text-sm text-gray-600">
              Latest result: {comparison.latest} {comparison.protocol.unit}
              {comparison.latest === comparison.personalBest && (
                <span className="ml-2 text-green-600 font-medium">
                  (Personal Best!)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}