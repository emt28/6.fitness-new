import { useAthleteAssessments } from '@/hooks/use-assessments';
import { useProtocols } from '@/hooks/use-protocols';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

interface AssessmentHistoryProps {
  athleteId: string;
  protocolId?: string;
}

export function AssessmentHistory({ athleteId, protocolId }: AssessmentHistoryProps) {
  const { data: assessments, isLoading } = useAthleteAssessments(athleteId, protocolId);
  const { data: protocols } = useProtocols();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!assessments?.length) {
    return (
      <div className="text-gray-500 text-center p-8">
        No assessments recorded yet
      </div>
    );
  }

  // Group assessments by protocol
  const groupedAssessments = assessments.reduce((acc, assessment) => {
    const protocol = protocols?.find(p => p.id === assessment.protocolId);
    if (!protocol) return acc;

    if (!acc[protocol.id]) {
      acc[protocol.id] = {
        protocol,
        assessments: [],
      };
    }
    acc[protocol.id].assessments.push(assessment);
    return acc;
  }, {} as Record<string, { protocol: typeof protocols[0], assessments: typeof assessments }>);

  return (
    <div className="space-y-6">
      {Object.values(groupedAssessments).map(({ protocol, assessments }) => {
        const sortedAssessments = [...assessments].sort(
          (a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
        );
        const latest = sortedAssessments[0];
        const previous = sortedAssessments[1];
        const trend = previous
          ? protocol.criteria === 'lower'
            ? latest.value < previous.value
            : latest.value > previous.value
          : null;

        return (
          <div key={protocol.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{protocol.name}</h3>
                {trend !== null && (
                  <div className={`flex items-center ${
                    trend ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend ? (
                      <TrendingUp className="h-5 w-5 mr-1" />
                    ) : (
                      <TrendingDown className="h-5 w-5 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {trend ? 'Improving' : 'Declining'}
                    </span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Result ({protocol.unit})
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAssessments.map((assessment) => (
                      <tr key={assessment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(assessment.assessedAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assessment.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            {
                              excellent: 'bg-green-100 text-green-800',
                              median: 'bg-yellow-100 text-yellow-800',
                              needs_improvement: 'bg-red-100 text-red-800',
                            }[assessment.performanceLevel]
                          }`}>
                            {assessment.performanceLevel.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {assessment.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}