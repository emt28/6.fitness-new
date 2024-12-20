import { useState } from 'react';
import { TemplateForm } from './template-form';
import { TemplateList } from './template-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AssessmentTemplate } from '@/types/template';

export function TemplateManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AssessmentTemplate | undefined>();

  const handleEdit = (template: AssessmentTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingTemplate(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Assessment Templates</h2>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        )}
      </div>

      {showForm ? (
        <TemplateForm
          template={editingTemplate}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingTemplate(undefined);
          }}
        />
      ) : (
        <TemplateList onEdit={handleEdit} />
      )}
    </div>
  );
}