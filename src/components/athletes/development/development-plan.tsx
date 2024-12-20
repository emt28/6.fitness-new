import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GoalForm } from './goal-form';
import { GoalList } from './goal-list';
import { DevelopmentGoal } from '@/types/development';
import { useGoals } from '@/hooks/use-goals';

interface DevelopmentPlanProps {
  athleteId: string;
}

export function DevelopmentPlan({ athleteId }: DevelopmentPlanProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<DevelopmentGoal | undefined>();
  const { data: goals, isLoading } = useGoals(athleteId);

  const handleEdit = (goal: DevelopmentGoal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingGoal(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Development Plan</h2>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Goal
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <GoalForm
            athleteId={athleteId}
            goal={editingGoal}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingGoal(undefined);
            }}
          />
        </div>
      ) : (
        <GoalList
          goals={goals || []}
          onEdit={handleEdit}
          onDelete={(goalId) => {
            // TODO: Implement goal deletion
            console.log('Delete goal:', goalId);
          }}
        />
      )}
    </div>
  );
}