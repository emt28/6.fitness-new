import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { FeedbackTemplate } from '@/types/feedback';
import { useDeleteFeedbackTemplate } from '@/hooks/use-feedback';

interface FeedbackTemplateListProps {
  templates: FeedbackTemplate[];
  onSelect?: (template: FeedbackTemplate) => void;
}

export function FeedbackTemplateList({ templates, onSelect }: FeedbackTemplateListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const deleteTemplate = useDeleteFeedbackTemplate();

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div key={template.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.mainFocus}</p>
              </div>
              <div className="flex items-center space-x-2">
                {onSelect && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(template)}
                  >
                    Use Template
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate.mutate(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
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
              <div className="mt-4 pt-4 border-t border-gray-200">
                {template.secondaryGoals.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-700">Secondary Goals</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {template.secondaryGoals.map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {template.drills.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-700">Common Drills</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {template.drills.map((drill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                        >
                          {drill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {template.notes && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700">Default Notes</h4>
                    <p className="mt-1 text-sm text-gray-600">{template.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}