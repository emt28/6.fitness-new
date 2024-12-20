import { format } from 'date-fns';
import { TrainingLogEntry } from '@/types/feedback';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TrainingLogProps {
  entries: TrainingLogEntry[];
}

export function TrainingLog({ entries }: TrainingLogProps) {
  const getStatusIcon = (status: 'present' | 'late' | 'absent') => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(entry.attendanceStatus)}
                <span className="text-sm font-medium capitalize">
                  {entry.attendanceStatus}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Main Focus</h4>
                <p className="mt-1 text-sm text-gray-900">{entry.feedback.mainFocus}</p>
              </div>

              {entry.feedback.secondaryGoals.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Secondary Goals</h4>
                  <ul className="mt-1 space-y-1">
                    {entry.feedback.secondaryGoals.map((goal, index) => (
                      <li key={index} className="text-sm text-gray-900">
                        • {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.feedback.drills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Drills Performed</h4>
                  <ul className="mt-1 space-y-1">
                    {entry.feedback.drills.map((drill, index) => (
                      <li key={index} className="text-sm text-gray-900">
                        • {drill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.feedback.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Coach's Notes</h4>
                  <p className="mt-1 text-sm text-gray-900">{entry.feedback.notes}</p>
                </div>
              )}

              {entry.feedback.media && entry.feedback.media.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Media</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {entry.feedback.media.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Training media ${index + 1}`}
                        className="rounded-lg object-cover h-32 w-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}