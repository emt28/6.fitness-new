import { useState } from 'react';
import { ProtocolForm } from '@/components/protocols/protocol-form';
import { ProtocolList } from '@/components/protocols/protocol-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { TestProtocol } from '@/types/protocol';

export function ProtocolsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<TestProtocol | undefined>();
  const { can } = usePermissions();
  const canCreate = can('manage_assessments');

  const handleEdit = (protocol: TestProtocol) => {
    setEditingProtocol(protocol);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingProtocol(undefined);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Test Protocols</h1>
        {canCreate && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Protocol
          </Button>
        )}
      </div>

      {showForm && canCreate && (
        <ProtocolForm
          protocol={editingProtocol}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingProtocol(undefined);
          }}
        />
      )}
      
      {!showForm && (
        <ProtocolList onEdit={handleEdit} />
      )}
    </div>
  );
}