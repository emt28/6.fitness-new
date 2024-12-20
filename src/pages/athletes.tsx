import { useState } from 'react';
import { AthleteForm } from '@/components/athletes/athlete-form';
import { AthleteList } from '@/components/athletes/athlete-list';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

export function AthletesPage() {
  const [showForm, setShowForm] = useState(false);
  const { can } = usePermissions();
  const canCreate = can('manage_athletes');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Athletes</h1>
        {canCreate && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {showForm ? 'Close Form' : 'Register New Athlete'}
          </Button>
        )}
      </div>

      {showForm && canCreate && <AthleteForm />}
      <AthleteList />
    </div>
  );
}