import { format } from 'date-fns';
import { AttendanceStats } from '@/types/attendance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface AttendanceReportProps {
  stats: AttendanceStats;
}

export function AttendanceReport({ stats }: AttendanceReportProps) {
  const attendanceData = [
    { name: 'Present', value: stats.attendedSessions, color: '#22c55e' },
    { name: 'Late', value: stats.lateSessions, color: '#eab308' },
    { name: 'Absent', value: stats.missedSessions, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Sessions">
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Statistics</h4>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Total Sessions</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalSessions}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Attendance Rate</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.attendanceRate.toFixed(1)}%
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Attendance</h4>
              <div className="space-y-2">
                {stats.recentAttendance.map((record, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">{record.session.name}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}