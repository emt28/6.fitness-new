import { format } from 'date-fns';
import { Assessment } from '@/types/assessment';
import { TestProtocol } from '@/types/protocol';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Search, TrendingUp, TrendingDown, Tag } from 'lucide-react';

interface AssessmentHistoryTableProps {
  assessments: Assessment[];
  protocols: TestProtocol[];
}

export function AssessmentHistoryTable({ assessments, protocols }: AssessmentHistoryTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Group assessments by protocol
  const groupedAssessments = protocols.reduce((acc, protocol) => {
    // Filter by category if selected
    if (selectedCategory && !protocol.categories.includes(selectedCategory)) {
      return acc;
    }

    // Filter by search term
    if (searchTerm && !protocol.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return acc;
    }

    const protocolAssessments = assessments
      .filter(a => a.protocolId === protocol.id)
      .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());

    if (protocolAssessments.length > 0) {
      acc[protocol.id] = {
        protocol,
        assessments: protocolAssessments,
      };
    }
    return acc;
  }, {} as Record<string, { protocol: TestProtocol; assessments: Assessment[] }>);

  const getPerformanceBadgeColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'median':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTrend = (assessments: Assessment[], protocol: TestProtocol) => {
    if (assessments.length < 2) return null;
    
    const latest = assessments[0].value;
    const previous = assessments[1].value;
    const improvement = protocol.criteria === 'lower' 
      ? ((previous - latest) / previous) * 100
      : ((latest - previous) / previous) * 100;

    return {
      value: improvement,
      isPositive: improvement > 0,
    };
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...protocols
      .flatMap(p => p.categories)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(category => ({
        value: category,
        label: category.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }))
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Tests
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by test name..."
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="All Categories"
            />
          </div>
        </div>
      </div>

      {/* Assessment History */}
      <div className="space-y-8">
        {Object.entries(groupedAssessments).map(([protocolId, { protocol, assessments }]) => {
          const trend = calculateTrend(assessments, protocol);

          return (
            <div key={protocolId} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{protocol.name}</h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-sm text-gray-500">{protocol.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {protocol.categories.map(category => (
                          <span
                            key={category}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {category.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {trend && (
                    <div className="flex items-center space-x-2">
                      {trend.isPositive ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium",
                        trend.isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result ({protocol.unit})
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assessments.map((assessment, index) => (
                      <tr key={assessment.id} className={index === 0 ? "bg-blue-50" : undefined}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(assessment.assessedAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assessment.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getPerformanceBadgeColor(assessment.performanceLevel)
                          )}>
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
          );
        })}
      </div>
    </div>
  );
}