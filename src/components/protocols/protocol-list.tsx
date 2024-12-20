import { useProtocols, useDeleteProtocol } from '@/hooks/use-protocols';
import { Loader2, Trash2, PencilLine, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { usePermissions } from '@/hooks/use-permissions';
import { useState } from 'react';
import { TestProtocol, PROTOCOL_CATEGORIES, ProtocolCategory } from '@/types/protocol';
import { cn } from '@/lib/utils';

interface ProtocolListProps {
  onEdit?: (protocol: TestProtocol) => void;
}

export function ProtocolList({ onEdit }: ProtocolListProps) {
  const { data: protocols, isLoading, error } = useProtocols();
  const deleteProtocol = useDeleteProtocol();
  const { can } = usePermissions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<ProtocolCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const canManage = can('manage_assessments');

  const filteredProtocols = protocols?.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategories = selectedCategories.length === 0 ||
      selectedCategories.some(category => protocol.categories.includes(category));
    return matchesSearch && matchesCategories;
  });

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
        Failed to load protocols
      </div>
    );
  }

  if (!protocols?.length) {
    return (
      <div className="text-gray-500 text-center p-8">
        No test protocols defined yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Protocols
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <Select
            options={PROTOCOL_CATEGORIES}
            value={selectedCategories}
            onChange={setSelectedCategories}
            isMulti
            placeholder="Select categories..."
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredProtocols?.map((protocol) => (
          <div key={protocol.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{protocol.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{protocol.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {protocol.categories.map((category) => (
                      <span
                        key={category}
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          "bg-blue-100 text-blue-800"
                        )}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {PROTOCOL_CATEGORIES.find(c => c.value === category)?.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {canManage && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(protocol)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProtocol.mutate(protocol.id)}
                        disabled={deleteProtocol.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === protocol.id ? null : protocol.id)}
                    className="text-gray-600"
                  >
                    {expandedId === protocol.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className="mr-4">Unit: {protocol.unit}</span>
                <span>
                  Performance criteria: {protocol.criteria === 'lower' ? 'Lower is better' : 'Higher is better'}
                </span>
              </div>
              {expandedId === protocol.id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Normative Data</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Age Group
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Needs Improvement
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Median
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Excellent
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {protocol.normativeData.map((data, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {data.ageGroup}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {data.needs_improvement.min} - {data.needs_improvement.max}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {data.median.min} - {data.median.max}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {data.excellent.min} - {data.excellent.max}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}