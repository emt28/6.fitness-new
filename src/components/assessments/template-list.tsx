import { useState } from 'react';
import { useTemplates, useDeleteTemplate } from '@/hooks/use-templates';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, PencilLine, ChevronDown, ChevronUp } from 'lucide-react';
import { AssessmentTemplate } from '@/types/template';
import { format } from 'date-fns';

interface TemplateListProps {
  onEdit?: (template: AssessmentTemplate) => void;
  onSelect?: (template: AssessmentTemplate) => void;
  selectable?: boolean;
}

export function TemplateList({ onEdit, onSelect, selectable = false }: TemplateListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: templates, isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();

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
        No assessment templates defined yet
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
                {selectable && (
                  <Button
                    onClick={() => onSelect?.(template)}
                    variant="primary"
                    size="sm"
                  >
                    Use Template
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
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate.mutate(template.id)}
                    disabled={deleteTemplate.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
                <h4 className="text-sm font-medium text-gray-900 mb-2">Included Tests</h4>
                <ul className="space-y-2">
                  {template.protocols.map((protocol) => (
                    <li key={protocol.id} className="text-sm text-gray-600">
                      • {protocol.name} ({protocol.unit})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}