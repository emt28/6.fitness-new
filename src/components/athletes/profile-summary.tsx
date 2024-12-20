import { useMemo } from 'react';
import { Award, TrendingUp, TrendingDown, Calendar, Star, AlertCircle } from 'lucide-react';
import { Assessment } from '@/types/assessment';
import { TestProtocol } from '@/types/protocol';
import { AttendanceStats } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface ProfileSummaryProps {
  assessments: Assessment[];
  protocols: TestProtocol[];
  attendanceStats?: AttendanceStats;
  timeframe?: '3m' | '6m' | '1y';
}

export function ProfileSummary({ 
  assessments, 
  protocols, 
  attendanceStats,
  timeframe = '3m' 
}: ProfileSummaryProps) {
  const summary = useMemo(() => {
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

    // Filter recent assessments
    const recentAssessments = assessments.filter(
      a => new Date(a.assessedAt) >= threshold
    );

    // Calculate trends for each protocol
    const trends = protocols.reduce((acc, protocol) => {
      const protocolAssessments = recentAssessments
        .filter(a => a.protocolId === protocol.id)
        .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime());

      if (protocolAssessments.length >= 2) {
        const first = protocolAssessments[0];
        const last = protocolAssessments[protocolAssessments.length - 1];
        const change = protocol.criteria === 'lower'
          ? ((first.value - last.value) / first.value) * 100
          : ((last.value - first.value) / first.value) * 100;

        acc[protocol.id] = {
          name: protocol.name,
          change,
          unit: protocol.unit,
          improved: change > 0,
        };
      }
      return acc;
    }, {} as Record<string, { name: string; change: number; unit: string; improved: boolean }>);

    // Identify strengths and areas for improvement
    const strengths: string[] = [];
    const improvements: string[] = [];

    protocols.forEach(protocol => {
      const protocolAssessments = recentAssessments
        .filter(a => a.protocolId === protocol.id)
        .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());

      if (protocolAssessments.length > 0) {
        const latest = protocolAssessments[0];
        if (latest.performanceLevel === 'excellent') {
          strengths.push(protocol.name);
        } else if (latest.performanceLevel === 'needs_improvement') {
          improvements.push(protocol.name);
        }
      }
    });

    // Calculate achievements
    const achievements = [];
    
    // Achievement for excellent performance
    if (strengths.length > 0) {
      achievements.push({
        type: 'excellence',
        title: 'Performance Excellence',
        description: `Achieved excellent performance in ${strengths.length} ${strengths.length === 1 ? 'area' : 'areas'}`,
      });
    }

    // Achievement for significant improvement
    const significantImprovements = Object.values(trends).filter(t => t.change >= 10);
    if (significantImprovements.length > 0) {
      achievements.push({
        type: 'improvement',
        title: 'Significant Progress',
        description: `Made significant improvements in ${significantImprovements.length} ${significantImprovements.length === 1 ? 'metric' : 'metrics'}`,
      });
    }

    // Achievement for attendance
    if (attendanceStats?.attendanceRate >= 90) {
      achievements.push({
        type: 'attendance',
        title: 'Consistent Training',
        description: 'Maintained over 90% attendance rate',
      });
    }

    return {
      trends,
      strengths,
      improvements,
      achievements,
    };
  }, [assessments, protocols, attendanceStats, timeframe]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Performance Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
          Recent Performance Trends
        </h3>
        <div className="space-y-4">
          {Object.values(summary.trends).map(trend => (
            <div
              key={trend.name}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                trend.improved ? "bg-green-50" : "bg-red-50"
              )}
            >
              <span className="text-sm font-medium">{trend.name}</span>
              <div className="flex items-center">
                {trend.improved ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  trend.improved ? "text-green-600" : "text-red-600"
                )}>
                  {trend.improved ? "+" : ""}{trend.change.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
          {Object.keys(summary.trends).length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No recent performance data available
            </p>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          Key Metrics
        </h3>
        <div className="space-y-4">
          {summary.strengths.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Top Strengths</h4>
              <ul className="space-y-1">
                {summary.strengths.map(strength => (
                  <li key={strength} className="text-sm text-green-600 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.improvements.length > 0 && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-orange-800 mb-2">Areas for Focus</h4>
              <ul className="space-y-1">
                {summary.improvements.map(area => (
                  <li key={area} className="text-sm text-orange-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {attendanceStats && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Training Consistency</h4>
              <div className="flex items-center text-blue-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {attendanceStats.attendanceRate.toFixed(1)}% attendance rate
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 text-purple-500 mr-2" />
          Recent Achievements
        </h3>
        <div className="space-y-4">
          {summary.achievements.map((achievement, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg",
                {
                  'bg-yellow-50': achievement.type === 'excellence',
                  'bg-green-50': achievement.type === 'improvement',
                  'bg-blue-50': achievement.type === 'attendance',
                }
              )}
            >
              <h4 className={cn(
                "text-sm font-medium mb-1",
                {
                  'text-yellow-800': achievement.type === 'excellence',
                  'text-green-800': achievement.type === 'improvement',
                  'text-blue-800': achievement.type === 'attendance',
                }
              )}>
                {achievement.title}
              </h4>
              <p className={cn(
                "text-sm",
                {
                  'text-yellow-600': achievement.type === 'excellence',
                  'text-green-600': achievement.type === 'improvement',
                  'text-blue-600': achievement.type === 'attendance',
                }
              )}>
                {achievement.description}
              </p>
            </div>
          ))}
          {summary.achievements.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No recent achievements to display
            </p>
          )}
        </div>
      </div>
    </div>
  );
}