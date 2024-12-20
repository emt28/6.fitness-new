import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Clock, X } from 'lucide-react';
import { FitnessSession, SessionAttendance, AttendanceStatus } from '@/types/attendance';
import { Athlete } from '@/types/athlete';
import { useRecordAttendance } from '@/hooks/use-attendance';

const attendanceSchema = z.object({
  athleteId: z.string().min(1, 'Athlete is required'),
  status: z.enum(['present', 'late', 'absent']),
  notes: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  session: FitnessSession;
  date: Date;
  registeredAthletes: Athlete[];
  attendance: SessionAttendance[];
}

export function AttendanceForm({
  session,
  date,
  registeredAthletes,
  attendance,
}: AttendanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recordAttendance = useRecordAttendance();

  const attendanceByAthlete = new Map(
    attendance.map(a => [a.athleteId, a])
  );

  const handleAttendanceUpdate = async (athleteId: string, status: AttendanceStatus) => {
    try {
      setIsSubmitting(true);
      await recordAttendance.mutateAsync({
        sessionId: session.id,
        athleteId,
        date: date.toISOString(),
        status,
      });
    } catch (error) {
      console.error('Failed to record attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusClass = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'late':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'absent':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {registeredAthletes.map(athlete => {
        const record = attendanceByAthlete.get(athlete.id);
        
        return (
          <div
            key={athlete.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              record ? getStatusClass(record.status) : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {record && getStatusIcon(record.status)}
              <span className="text-sm font-medium">
                {athlete.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={record?.status === 'present' ? 'primary' : 'outline'}
                onClick={() => handleAttendanceUpdate(athlete.id, 'present')}
                disabled={isSubmitting}
              >
                <Check className="h-4 w-4 mr-1" />
                Present
              </Button>
              <Button
                size="sm"
                variant={record?.status === 'late' ? 'primary' : 'outline'}
                onClick={() => handleAttendanceUpdate(athlete.id, 'late')}
                disabled={isSubmitting}
              >
                <Clock className="h-4 w-4 mr-1" />
                Late
              </Button>
              <Button
                size="sm"
                variant={record?.status === 'absent' ? 'primary' : 'outline'}
                onClick={() => handleAttendanceUpdate(athlete.id, 'absent')}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-1" />
                Absent
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}