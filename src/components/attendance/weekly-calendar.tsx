import { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useWeeklyAttendance } from '@/hooks/use-attendance';
import { AttendanceSession } from './attendance-session';

export function WeeklyCalendar() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const { data, isLoading, error } = useWeeklyAttendance(currentWeek);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const days = direction === 'prev' ? -7 : 7;
      return addDays(prev, days);
    });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Failed to load schedule. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Week of {format(currentWeek, 'MMM d, yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => (
          <div key={day.toISOString()} className="space-y-2">
            <div className={`text-sm font-medium text-center p-2 rounded-t-lg ${
              isSameDay(day, new Date()) 
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-50 text-gray-900'
            }`}>
              {format(day, 'EEE')}
              <div className={isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-500'}>
                {format(day, 'MMM d')}
              </div>
            </div>
            
            <div className="space-y-2">
              {data?.schedules.map(schedule => (
                schedule.sessions
                  .filter(session => 
                    session.dayOfWeek === day.getDay() &&
                    (!session.excludedDates?.includes(format(day, 'yyyy-MM-dd')))
                  )
                  .map(session => (
                    <AttendanceSession
                      key={session.id}
                      session={session}
                      date={day}
                      attendance={data.attendance.filter(a => 
                        a.sessionId === session.id && 
                        isSameDay(new Date(a.date), day)
                      )}
                    />
                  ))
              ))}
              
              {(!data?.schedules.length || !data?.schedules.some(schedule => 
                schedule.sessions.some(session => 
                  session.dayOfWeek === day.getDay() &&
                  (!session.excludedDates?.includes(format(day, 'yyyy-MM-dd')))
                )
              )) && (
                <div className="text-center py-4 text-sm text-gray-500">
                  No sessions scheduled
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}