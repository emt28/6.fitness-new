import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { GoalNotes } from './goal-notes';
import {
  Target,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
} from 'lucide-react';
import { DevelopmentGoal, GoalStatus, CreateGoalNoteData } from '@/types/development';
import { cn } from '@/lib/utils';
import { useCreateGoalNote } from '@/hooks/use-goals';

interface GoalListProps {
  goals: DevelopmentGoal[];
  onEdit?: (goal: DevelopmentGoal) => void;
  onDelete?: (goalId: string) => void;
}

export function GoalList({ goals, onEdit, onDelete }: GoalListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const createNote = useCreateGoalNote();

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case 'onTrack':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'atRisk':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offTrack':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusClass = (status: GoalStatus) => {
    switch (status) {
      case 'onTrack':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'atRisk':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'offTrack':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusLabel = (status: GoalStatus) => {
    switch (status) {
      case 'onTrack':
        return 'On Track';
      case 'atRisk':
        return 'At Risk';
      case 'offTrack':
        return 'Off Track';
      case 'completed':
        return 'Completed';
    }
  };

  const handleAddNote = async (goalId: string, data: CreateGoalNoteData) => {
    await createNote.mutateAsync({ goalId, data });
  };

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const daysUntilDeadline = differenceInDays(new Date(goal.deadline), new Date());
        const isExpanded = expandedId === goal.id;

        return (
          <div
            key={goal.id}
            className={cn(
              "border rounded-lg overflow-hidden",
              getStatusClass(goal.status)
            )}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <h3 className="text-lg font-medium">{goal.title}</h3>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      {getStatusIcon(goal.status)}
                      <span className="ml-1">{getStatusLabel(goal.status)}</span>
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {daysUntilDeadline > 0
                        ? `${daysUntilDeadline} days remaining`
                        : 'Deadline passed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(goal)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      goal.status === 'completed' ? "bg-blue-500" :
                      goal.status === 'onTrack' ? "bg-green-500" :
                      goal.status === 'atRisk' ? "bg-yellow-500" :
                      "bg-red-500"
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {goal.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm">{goal.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {goal.targetMetric && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Target</h4>
                        <p className="text-sm">
                          {goal.targetMetric.value} {goal.targetMetric.unit}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium mb-1">Deadline</h4>
                      <p className="text-sm">
                        {format(new Date(goal.deadline), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {goal.assignedToUser && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Assigned To</h4>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {goal.assignedToUser.name} ({goal.assignedToUser.role.replace('_', ' ')})
                        </span>
                      </div>
                    </div>
                  )}

                  {goal.linkedSessions && goal.linkedSessions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Linked Sessions</h4>
                      <div className="flex flex-wrap gap-2">
                        {goal.linkedSessions.map((sessionId) => (
                          <span
                            key={sessionId}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white"
                          >
                            Session {sessionId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <GoalNotes
                      notes={goal.notes}
                      onAddNote={(data) => handleAddNote(goal.id, data)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {goals.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No development goals set
        </div>
      )}
    </div>
  );
}