import { useState } from 'react';
import { useUsers, useDeleteUser, useUpdateUserStatus } from '@/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Trash2, PencilLine, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types/auth';
import { Athlete } from '@/types/athlete';

interface UserListProps {
  users: User[];
  athletes: Athlete[];
  onEdit?: (user: User) => void;
}

export function UserList({ users, athletes, onEdit }: UserListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();

  const getRoleLabel = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getAssignedAthletes = (user: User) => {
    if (!user.assignments) return [];
    return user.assignments.map(assignment => {
      const athlete = athletes.find(a => a.id === assignment.athleteId);
      return {
        ...assignment,
        athleteName: athlete?.name || 'Unknown Athlete',
      };
    });
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateStatus.mutateAsync({ userId, isActive });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  if (!users.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No users found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getRoleLabel(user.role)}
                  </span>
                  {!user.isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Active</span>
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={(checked) => handleStatusChange(user.id, checked)}
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(user)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <PencilLine className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteUser.mutate(user.id)}
                  disabled={deleteUser.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                  className="text-gray-600"
                >
                  {expandedId === user.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {expandedId === user.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Athletes</h4>
                    {getAssignedAthletes(user).length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {getAssignedAthletes(user).map((assignment) => (
                          <div
                            key={assignment.athleteId}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                          >
                            <span className="text-sm text-gray-900">{assignment.athleteName}</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getRoleLabel(assignment.role)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No athletes assigned</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Account Details</h4>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-gray-500">Created</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(user.created).toLocaleDateString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Last Updated</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(user.updated).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}