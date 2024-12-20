import { format } from 'date-fns';
import { Assessment } from '@/types/assessment';
import { TestProtocol } from '@/types/protocol';
import { Athlete } from '@/types/athlete';

interface ComparisonTableProps {
  data: Array<{
    athlete: Athlete | undefined;
    assessments: Assessment[];
  }>;
  protocol: TestProtocol | undefined;
}

export function ComparisonTable({ data, protocol }: ComparisonTableProps) {
  if (!protocol || data.length === 0) {
    return null;
  }

  const allDates = Array.from(
    new Set(
      data.flatMap(({ assessments }) =>
        assessments.map(a => format(new Date(a.assessedAt), 'MMM d, yyyy'))
      )
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            {data.map(({ athlete }) => (
              athlete && (
                <th
                  key={athlete.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {athlete.name}
                </th>
              )
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allDates.map(date => (
            <tr key={date}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {date}
              </td>
              {data.map(({ athlete, assessments }) => {
                if (!athlete) return null;
                const assessment = assessments.find(
                  a => format(new Date(a.assessedAt), 'MMM d, yyyy') === date
                );
                return (
                  <td
                    key={athlete.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {assessment ? (
                      <div className="flex items-center space-x-2">
                        <span>{assessment.value} {protocol.unit}</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            {
                              excellent: 'bg-green-100 text-green-800',
                              median: 'bg-yellow-100 text-yellow-800',
                              needs_improvement: 'bg-red-100 text-red-800',
                            }[assessment.performanceLevel]
                          }`}
                        >
                          {assessment.performanceLevel.replace('_', ' ')}
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}