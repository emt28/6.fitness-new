import { useState } from 'react';
import { TemplateForm } from './template-form';
import { TemplateList } from './template-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SessionTemplate } from '@/types/attendance';
import { useCreateSchedule } from '@/hooks/use-attendance';
import { startOfWeek, format } from 'date-fns';

export function TemplateManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SessionTemplate | undefined>();
  const createSchedule = useCreateSchedule();

  const handleEdit = (template: SessionTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleApplyTemplate = async (template: SessionTemplate) => {
    try {
      const weekStart = startOfWeek(new Date());
      const weekStartDate = format(weekStart, 'yyyy-MM-dd');
      
      await createSchedule.mutateAsync({
        templateId: template.id,
        weekStartDate,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to apply template:', error);
      throw error;
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingTemplate(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Session Templates</h2>
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
        <TemplateList
          onEdit={handleEdit}
          onApply={handleApplyTemplate}
        />
      )}
    </div>
  );
}