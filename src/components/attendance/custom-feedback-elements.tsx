import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useCustomElements } from '@/hooks/use-feedback';

interface CustomElementsProps {
  type: 'focus' | 'goals' | 'drills';
  onSelect: (value: string) => void;
}

export function CustomFeedbackElements({ type, onSelect }: CustomElementsProps) {
  const [showInput, setShowInput] = useState(false);
  const [newElement, setNewElement] = useState('');
  const { data: customElements, addElement, removeElement } = useCustomElements(type);

  const handleAdd = () => {
    if (newElement.trim()) {
      addElement.mutate(newElement.trim());
      setNewElement('');
      setShowInput(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'focus':
        return 'Custom Focus Areas';
      case 'goals':
        return 'Custom Goals';
      case 'drills':
        return 'Custom Drills';
      default:
        return '';
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{getTitle()}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowInput(!showInput)}
          className="text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Custom
        </Button>
      </div>

      {showInput && (
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={newElement}
            onChange={(e) => setNewElement(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder={`Add new ${type === 'focus' ? 'focus area' : type === 'goals' ? 'goal' : 'drill'}`}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!newElement.trim()}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowInput(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {customElements && customElements.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {customElements.map((element) => (
            <div
              key={element.id}
              className="group flex items-center space-x-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() => onSelect(element.value)}
              >
                {element.value}
              </span>
              <button
                type="button"
                onClick={() => removeElement.mutate(element.id)}
                className="hidden group-hover:inline-flex text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}