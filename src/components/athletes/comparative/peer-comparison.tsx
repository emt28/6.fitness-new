import { useMemo } from 'react';
import { Assessment } from '@/types/assessment';
import { TestProtocol } from '@/types/protocol';
import { Athlete } from '@/types/athlete';
import { Users, TrendingUp, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeerComparisonProps {
  athlete: Athlete;
  assessments: Assessment[];
  protocols: TestProtocol[];
  peerAssessments: Assessment[];
  peerAthletes: Athlete[];
}

export function PeerComparison({
  athlete,
  assessments,
  protocols,
  peerAssessments,
  peerAthletes,
}: PeerComparisonProps) {
  const comparisons = useMemo(() => {
    return protocols.map(protocol => {
      // Get athlete's latest assessment for this protocol
      const athleteLatest = assessments
        .filter(a => a.protocolId === protocol.id)
        .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime())[0];

      if (!athleteLatest) return null;

      // Get peer assessments for this protocol
      const peerLatest = peerAthletes.map(peer => {
        const latest = peerAssessments
          .filter(a => a.athleteId === peer.id && a.protocolId === protocol.id)
          .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime())[0];
        return latest;
      }).filter(Boolean) as Assessment[];

      // Calculate percentile
      const values = peerLatest.map(a => a.value);
      values.push(athleteLatest.value);
      values.sort((a, b) => protocol.criteria === 'lower' ? a - b : b - a);
      
      const athleteRank = values.indexOf(athleteLatest.value) + 1;
      const percentile = ((values.length - athleteRank) / values.length) * 100;

      // Calculate average
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;

      // Determine if athlete is above average
      const isAboveAverage = protocol.criteria === 'lower'
        ? athleteLatest.value < average
        : athleteLatest.value > average;

      return {
        protocol,
        value: athleteLatest.value,
        percentile,
        average,
        isAboveAverage,
        totalPeers: values.length - 1,
      };
    }).filter(Boolean);
  }, [athlete, assessments, protocols, peerAssessments, peerAthletes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 text-blue-500 mr-2" />
          Peer Comparison
        </h3>
        <span className="text-sm text-gray-500">
          Comparing with {peerAthletes.length} peers
        </span>
      </div>

      <div className="grid gap-4">
        {comparisons.map(comparison => (
          <div
            key={comparison.protocol.id}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{comparison.protocol.name}</h4>
              <div className="flex items-center space-x-2">
                {comparison.percentile >= 90 && (
                  <Medal className="h-4 w-4 text-yellow-500" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  comparison.isAboveAverage ? "text-green-600" : "text-red-600"
                )}>
                  {comparison.percentile.toFixed(0)}th percentile
                </span>
              </div>
            </div>

            {/* Percentile Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className={cn(
                  "absolute left-0 top-0 h-full rounded-full",
                  comparison.percentile >= 90 ? "bg-yellow-500" :
                  comparison.percentile >= 75 ? "bg-green-500" :
                  comparison.percentile >= 50 ? "bg-blue-500" :
                  "bg-red-500"
                )}
                style={{ width: `${comparison.percentile}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Your result: {comparison.value} {comparison.protocol.unit}
              </span>
              <span>
                Peer average: {comparison.average.toFixed(2)} {comparison.protocol.unit}
              </span>
            </div>

            {/* Performance Description */}
            <p className="mt-2 text-sm text-gray-600">
              {comparison.percentile >= 90 ? (
                `Outstanding! You're in the top 10% for ${comparison.protocol.name}`
              ) : comparison.percentile >= 75 ? (
                `Great performance! Better than ${comparison.percentile.toFixed(0)}% of your peers`
              ) : comparison.percentile >= 50 ? (
                `Above average performance among your peers`
              ) : (
                `Room for improvement - currently at ${comparison.percentile.toFixed(0)}th percentile`
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}