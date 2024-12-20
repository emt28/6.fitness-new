import { useState } from 'react';
import { format, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { FitnessSession, SessionAttendance } from '@/types/attendance';
import { useAthletes } from '@/hooks/use-athletes';
import { AttendanceForm } from './attendance-form';

interface AttendanceSessionProps {
  session: FitnessSession;
  date: Date;
  attendance: SessionAttendance[];
}

export function AttendanceSession({ session, date, attendance }: AttendanceSessionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: athletes } = useAthletes();

  // Get the registered athletes for this session
  const registeredAthletes = athletes?.filter(
    athlete => session.selectedAthletes?.includes(athlete.id)
  ) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {session.name}
          </h3>
          <p className="text-xs text-gray-500">
            {format(parse(session.startTime, 'HH:mm', new Date()), 'h:mm a')} -
            {format(parse(session.endTime, 'HH:mm', new Date()), 'h:mm a')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-xs">
              {registeredAthletes.length}/{session.maxAthletes}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-100">
          {registeredAthletes.length > 0 ? (
            <AttendanceForm
              session={session}
              date={date}
              registeredAthletes={registeredAthletes}
              attendance={attendance}
            />
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              No athletes registered for this session
            </p>
          )}
        </div>
      )}
    </div>
  );
}