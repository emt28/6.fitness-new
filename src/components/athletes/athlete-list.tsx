import { useAthletes, useDeleteAthlete } from '@/hooks/use-athletes';
import { calculateAge } from '@/lib/utils';
import { Loader2, Trash2, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { useNavigate } from 'react-router-dom';

export function AthleteList() {
  const { data: athletes, isLoading, error } = useAthletes();
  const deleteAthlete = useDeleteAthlete();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const canManage = can('manage_athletes');
  const canViewAll = can('view_all');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-md">
        Failed to load athletes
      </div>
    );
  }

  if (!athletes?.length) {
    return (
      <div className="text-gray-500 text-center p-8">
        No athletes registered yet
      </div>
    );
  }

  // Filter athletes based on permissions
  const filteredAthletes = canViewAll 
    ? athletes 
    : athletes.filter(athlete => athlete.createdBy === '1'); // Replace with actual user ID logic

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Age
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dominant Hand
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              WTN
            </th>
            {canManage && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAthletes.map((athlete) => (
            <tr key={athlete.id}>
              <td 
                className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                onClick={() => navigate(`/athletes/${athlete.id}`)}
              >
                {athlete.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {calculateAge(athlete.dateOfBirth)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                {athlete.dominantHand}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {athlete.wtn}
              </td>
              {canManage && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/athletes/${athlete.id}`)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAthlete.mutate(athlete.id)}
                      disabled={deleteAthlete.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}