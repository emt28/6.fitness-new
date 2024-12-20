import { AthleteReport } from '@/types/report';
import { Award, TrendingUp, AlertTriangle } from 'lucide-react';

interface ReportSummaryProps {
  report: AthleteReport;
  detailed?: boolean;
}

export function ReportSummary({ report, detailed = false }: ReportSummaryProps) {
  const { summary } = report;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Total Assessments</p>
              <p className="text-2xl font-semibold text-blue-600">
                {summary.totalAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-900">Improvement Rate</p>
              <p className="text-2xl font-semibold text-green-600">
                {summary.improvementRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {detailed && (
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-900">Areas for Focus</p>
                <p className="text-2xl font-semibold text-orange-600">
                  {summary.areasForImprovement.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {detailed && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
            <ul className="space-y-1">
              {summary.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <Award className="h-4 w-4 text-green-500 mr-2" />
                  {strength}
                </li>
              ))}
              {summary.strengths.length === 0 && (
                <li className="text-sm text-gray-500 italic">No strengths identified yet</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Areas for Improvement</h4>
            <ul className="space-y-1">
              {summary.areasForImprovement.map((area, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                  {area}
                </li>
              ))}
              {summary.areasForImprovement.length === 0 && (
                <li className="text-sm text-gray-500 italic">No areas for improvement identified</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}