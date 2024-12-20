import { useState } from 'react';
import { useAthleteAssessments } from '@/hooks/use-assessments';
import { useProtocols } from '@/hooks/use-protocols';
import { AssessmentHistoryTable } from './assessment-history-table';
import { PerformanceMetrics } from './performance-metrics';
import { ProfileSummary } from './profile-summary';
import { PeerComparison } from './comparative/peer-comparison';
import { HistoricalComparison } from './comparative/historical-comparison';
import { DevelopmentPlan } from './development/development-plan';
import { TrainingLog } from '@/components/attendance/training-log';
import { useAthleteAttendanceStats } from '@/hooks/use-attendance';
import { useTrainingLog } from '@/hooks/use-feedback';
import { usePeerData } from '@/hooks/use-peer-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Athlete } from '@/types/athlete';
import { Loader2, TrendingUp, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AthleteProfileProps {
  athlete: Athlete;
}

export function AthleteProfile({ athlete }: AthleteProfileProps) {
  const [timeframe, setTimeframe] = useState<'3m' | '6m' | '1y'>('3m');
  const { data: assessments, isLoading: assessmentsLoading } = useAthleteAssessments(athlete.id);
  const { data: protocols, isLoading: protocolsLoading } = useProtocols();
  const { data: attendanceStats } = useAthleteAttendanceStats(athlete.id);
  const { data: trainingLog } = useTrainingLog(athlete.id);
  const { data: peerData, isLoading: peersLoading } = usePeerData(athlete);

  const isLoading = assessmentsLoading || protocolsLoading || peersLoading;

  return (
    <div className="space-y-8">
      {/* Time Frame Controls */}
      <div className="flex justify-end space-x-2">
        {(['3m', '6m', '1y'] as const).map((period) => (
          <Button
            key={period}
            variant={timeframe === period ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeframe(period)}
          >
            {period === '3m' ? '3 Months' :
             period === '6m' ? '6 Months' :
             '1 Year'}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Summary Overview */}
          {assessments && protocols && (
            <ProfileSummary
              assessments={assessments}
              protocols={protocols}
              attendanceStats={attendanceStats}
              timeframe={timeframe}
            />
          )}

          {/* Detailed Tabs */}
          <Tabs defaultValue="development" className="space-y-6">
            <TabsList>
              <TabsTrigger value="development">Development Plan</TabsTrigger>
              <TabsTrigger value="assessments">Assessment History</TabsTrigger>
              <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
              <TabsTrigger value="comparative">Comparative Insights</TabsTrigger>
              <TabsTrigger value="training">Training Log</TabsTrigger>
            </TabsList>

            <TabsContent value="development">
              <DevelopmentPlan athleteId={athlete.id} />
            </TabsContent>

            <TabsContent value="assessments">
              {assessments && protocols && (
                <AssessmentHistoryTable
                  assessments={assessments}
                  protocols={protocols}
                />
              )}
            </TabsContent>

            <TabsContent value="performance">
              {assessments && protocols && (
                <PerformanceMetrics
                  assessments={assessments}
                  protocols={protocols}
                  attendanceStats={attendanceStats}
                />
              )}
            </TabsContent>

            <TabsContent value="comparative">
              {assessments && protocols && peerData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PeerComparison
                    athlete={athlete}
                    assessments={assessments}
                    protocols={protocols}
                    peerAssessments={peerData.assessments}
                    peerAthletes={peerData.athletes}
                  />
                  <HistoricalComparison
                    assessments={assessments}
                    protocols={protocols}
                    timeframe={timeframe}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="training">
              {trainingLog && trainingLog.length > 0 ? (
                <TrainingLog entries={trainingLog} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No training logs available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}