import { DashboardStats } from '@/types/dashboard';
import { useAthletes } from '@/hooks/use-athletes';
import { useProtocols } from '@/hooks/use-protocols';
import { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Users,
  Calendar,
  Award,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CoachOverviewProps {
  stats: DashboardStats;
}

export function CoachOverview({ stats }: CoachOverviewProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const { data: athletes } = useAthletes();
  const { data: protocols } = useProtocols();

  // Filter athletes based on search term
  const filteredAthletes = athletes?.filter(athlete =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get recent assessments for each athlete
  const athletePerformance = filteredAthletes?.map(athlete => {
    const recentAssessments = stats.recentAssessments
      .filter(a => a.athleteId === athlete.id)
      .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());

    const performanceLevels = recentAssessments.reduce((acc, assessment) => {
      acc[assessment.performanceLevel] = (acc[assessment.performanceLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      athlete,
      recentAssessments,
      performanceLevels,
      lastAssessment: recentAssessments[0],
      needsAttention: recentAssessments.some(a => a.performanceLevel === 'needs_improvement'),
    };
  });

  const metrics = [
    { value: 'all', label: 'All Athletes' },
    { value: 'attention', label: 'Needs Attention' },
    { value: 'improving', label: 'Improving' },
    { value: 'declining', label: 'Declining' },
  ];

  const handleViewDetails = (athleteId: string) => {
    navigate(`/athletes/${athleteId}`);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Users className="h-10 w-10 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Athletes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeAthletes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Calendar className="h-10 w-10 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assessments This Week</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.recentAssessments.filter(a => 
                  new Date(a.assessedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Award className="h-10 w-10 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Improvement Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.assessmentsTrend}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Athlete Overview */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Athlete Overview</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search athletes..."
                  className="pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select
                options={metrics}
                value={selectedMetric}
                onChange={setSelectedMetric}
                placeholder="Filter by metric"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {athletePerformance?.map(({ athlete, lastAssessment, needsAttention }) => {
              if (selectedMetric === 'attention' && !needsAttention) return null;

              const protocol = protocols?.find(p => 
                lastAssessment?.protocolId === p.id
              );

              return (
                <div
                  key={athlete.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    needsAttention ? "border-red-200 bg-red-50" : "border-gray-200"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{athlete.name}</h3>
                      <p className="text-sm text-gray-500">
                        Age: {format(new Date(athlete.dateOfBirth), 'yyyy')} • WTN: {athlete.wtn}
                      </p>
                    </div>
                    {needsAttention && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {lastAssessment && protocol && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        Latest Assessment: {protocol.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {lastAssessment.value} {protocol.unit}
                        </span>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          lastAssessment.performanceLevel === 'excellent' 
                            ? "bg-green-100 text-green-800"
                            : lastAssessment.performanceLevel === 'median'
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        )}>
                          {lastAssessment.performanceLevel.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(new Date(lastAssessment.assessedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDetails(athlete.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}