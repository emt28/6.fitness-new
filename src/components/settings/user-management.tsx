import { useState } from 'react';
import { useUsers } from '@/hooks/use-users';
import { useAthletes } from '@/hooks/use-athletes';
import { UserList } from './user-list';
import { UserForm } from './user-form';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { User, UserRole } from '@/types/auth';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'lead_coach', label: 'Lead Coach' },
  { value: 'academy_coach', label: 'Academy Coach' },
  { value: 'fitness_trainer', label: 'Fitness Trainer' },
  { value: 'parent', label: 'Parent' },
];

export function UserManagement() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: athletes } = useAthletes();

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {showForm ? (
        <UserForm
          user={editingUser}
          athletes={athletes || []}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Select
                options={ROLE_OPTIONS}
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="Filter by role"
              />

              <Button
                onClick={() => setShowForm(true)}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          <UserList
            users={filteredUsers || []}
            athletes={athletes || []}
            onEdit={handleEdit}
          />
        </>
      )}
    </div>
  );
}