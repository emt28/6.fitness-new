import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAthletes } from '@/hooks/use-athletes';
import { AssessmentHistory } from '@/components/assessments/assessment-history';
import { AssessmentHistoryTable } from '@/components/athletes/assessment-history-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateAge } from '@/lib/utils';
import { AthleteForm } from '@/components/athletes/athlete-form';
import { PerformanceMetrics } from '@/components/athletes/performance-metrics';
import { CoachNotes } from '@/components/athletes/coach-notes';
import { TrainingLog } from '@/components/attendance/training-log';
import { usePermissions } from '@/hooks/use-permissions';
import { useAthleteAssessments } from '@/hooks/use-assessments';
import { useProtocols } from '@/hooks/use-protocols';
import { useAthleteNotes, useCreateNote } from '@/hooks/use-notes';
import { useAthleteAttendanceStats } from '@/hooks/use-attendance';
import { useTrainingLog } from '@/hooks/use-feedback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AthleteDetailsPage() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const { data: athletes } = useAthletes();
  const { data: assessments } = useAthleteAssessments(athleteId!);
  const { data: protocols } = useProtocols();
  const { data: notes } = useAthleteNotes(athleteId!);
  const { data: attendanceStats } = useAthleteAttendanceStats(athleteId!);
  const { data: trainingLog } = useTrainingLog(athleteId!);
  const createNote = useCreateNote();
  const [showEditForm, setShowEditForm] = useState(false);
  const { can } = usePermissions();

  const athlete = athletes?.find(a => a.id === athleteId);
  const canViewCoachNotes = can('manage_assessments');

  if (!athlete) {
    return <div>Athlete not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/athletes')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Athletes
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{athlete.name}</h1>
        </div>
        <Button
          onClick={() => setShowEditForm(!showEditForm)}
          className="flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          {showEditForm ? 'Cancel Edit' : 'Edit Athlete'}
        </Button>
      </div>

      {showEditForm ? (
        <AthleteForm athlete={athlete} onSuccess={() => setShowEditForm(false)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Athlete Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Age</dt>
                <dd className="text-lg text-gray-900">{calculateAge(athlete.dateOfBirth)} years</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="text-lg text-gray-900">
                  {new Date(athlete.dateOfBirth).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Dominant Hand</dt>
                <dd className="text-lg text-gray-900 capitalize">{athlete.dominantHand}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">World Tennis Number (WTN)</dt>
                <dd className="text-lg text-gray-900">{athlete.wtn}</dd>
              </div>
            </dl>
          </div>

          {attendanceStats && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Overview</h2>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Attendance Rate</dt>
                  <dd className="text-lg text-gray-900">
                    {attendanceStats.attendanceRate.toFixed(1)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Sessions</dt>
                  <dd className="text-lg text-gray-900">{attendanceStats.totalSessions}</dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-green-600">Present</dt>
                    <dd className="text-lg text-gray-900">{attendanceStats.attendedSessions}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-yellow-600">Late</dt>
                    <dd className="text-lg text-gray-900">{attendanceStats.lateSessions}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-red-600">Absent</dt>
                    <dd className="text-lg text-gray-900">{attendanceStats.missedSessions}</dd>
                  </div>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="assessments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assessments">Assessment History</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="training">Training Log</TabsTrigger>
          {canViewCoachNotes && <TabsTrigger value="notes">Coach Notes</TabsTrigger>}
        </TabsList>

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
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
              <PerformanceMetrics
                assessments={assessments}
                protocols={protocols}
                attendanceStats={attendanceStats}
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

        {canViewCoachNotes && (
          <TabsContent value="notes">
            <CoachNotes
              athleteId={athlete.id}
              notes={notes || []}
              onAddNote={async (data) => {
                await createNote.mutateAsync({
                  athleteId: athlete.id,
                  data,
                });
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}