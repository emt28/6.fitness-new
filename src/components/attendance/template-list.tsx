import { useState } from 'react';
import { useTemplates, useDeleteTemplate } from '@/hooks/use-attendance';
import { useAthletes } from '@/hooks/use-athletes';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, PencilLine, ChevronDown, ChevronUp, Calendar, Users } from 'lucide-react';
import { SessionTemplate } from '@/types/attendance';
import { format, parse } from 'date-fns';

interface TemplateListProps {
  onEdit?: (template: SessionTemplate) => void;
  onApply?: (template: SessionTemplate) => void;
}

export function TemplateList({ onEdit, onApply }: TemplateListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: templates, isLoading } = useTemplates();
  const { data: athletes } = useAthletes();
  const deleteTemplate = useDeleteTemplate();

  const weekDays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];

  const handleApplyTemplate = async (template: SessionTemplate) => {
    try {
      await onApply?.(template);
      // Show success message
      alert('Template applied successfully!');
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!templates?.length) {
    return (
      <div className="text-gray-500 text-center p-8">
        No session templates defined yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div key={template.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{template.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {onApply && (
                  <Button
                    onClick={() => handleApplyTemplate(template)}
                    className="flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Apply Template
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(template)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <PencilLine className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate.mutate(template.id)}
                  disabled={deleteTemplate.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                  className="text-gray-600"
                >
                  {expandedId === template.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {expandedId === template.id && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Sessions</h4>
                <div className="space-y-4">
                  {template.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {session.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {weekDays[session.dayOfWeek]},{' '}
                            {format(parse(session.startTime, 'HH:mm', new Date()), 'h:mm a')} -{' '}
                            {format(parse(session.endTime, 'HH:mm', new Date()), 'h:mm a')}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {session.selectedAthletes?.length || 0}/{session.maxAthletes}
                          </span>
                        </div>
                      </div>

                      {session.selectedAthletes && session.selectedAthletes.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Registered Athletes:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {session.selectedAthletes.map(athleteId => {
                              const athlete = athletes?.find(a => a.id === athleteId);
                              return athlete ? (
                                <span
                                  key={athleteId}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {athlete.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}