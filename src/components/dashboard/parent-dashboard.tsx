import { useState } from 'react';
import { useAthletes } from '@/hooks/use-athletes';
import { useAuth } from '@/contexts/auth-context';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AssessmentHistoryTable } from '@/components/athletes/assessment-history-table';
import { useAthleteAssessments } from '@/hooks/use-assessments';
import { useProtocols } from '@/hooks/use-protocols';
import { useAthleteAttendanceStats } from '@/hooks/use-attendance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Calendar, Award, TrendingUp } from 'lucide-react';

export function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: athletes } = useAthletes();
  const { data: protocols } = useProtocols();

  // Filter athletes based on parent's assignments
  const assignedAthletes = athletes?.filter(athlete => 
    user?.assignments?.some(assignment => 
      assignment.athleteId === athlete.id && assignment.role === 'parent'
    )
  ) || [];

  const [selectedAthlete] = useState(assignedAthletes[0]);

  // Fetch data for the selected athlete
  const { data: assessments } = useAthleteAssessments(selectedAthlete?.id || '');
  const { data: attendanceStats } = useAthleteAttendanceStats(selectedAthlete?.id || '');

  if (!selectedAthlete) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No athletes assigned to your account.</p>
        <p className="text-sm text-gray-400 mt-2">Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          {selectedAthlete.name}'s Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-900">World Tennis Number</p>
                <p className="text-2xl font-semibold text-blue-600">{selectedAthlete.wtn}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-900">Attendance Rate</p>
                <p className="text-2xl font-semibold text-green-600">
                  {attendanceStats?.attendanceRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-900">Recent Tests</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {assessments?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="assessments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assessments">Assessment History</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments">
          {assessments && protocols && (
            <AssessmentHistoryTable
              assessments={assessments}
              protocols={protocols}
            />
          )}
        </TabsContent>

        <TabsContent value="attendance">
          {attendanceStats && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h3>
              <div className="space-y-4">
                {attendanceStats.recentAttendance.map((record, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(record.date), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">{record.session.name}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}