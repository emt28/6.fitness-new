import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps {
  options: { value: string; label: string }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  maxItems?: number;
  className?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  isMulti = false,
  maxItems,
  className,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleValueChange = (newValue: string) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(newValue)) {
        onChange(currentValues.filter(v => v !== newValue));
      } else {
        if (!maxItems || currentValues.length < maxItems) {
          onChange([...currentValues, newValue]);
        }
      }
    } else {
      onChange(newValue);
      setIsOpen(false);
    }
  };

  const displayValue = React.useMemo(() => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return placeholder;
    }

    if (isMulti && Array.isArray(value)) {
      const selectedLabels = value
        .map(v => options.find(opt => opt.value === v)?.label)
        .filter(Boolean);
      
      return selectedLabels.length > 0
        ? selectedLabels.join(', ')
        : placeholder;
    }

    return options.find(opt => opt.value === value)?.label || placeholder;
  }, [value, options, isMulti, placeholder]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className={cn(
          'h-4 w-4 opacity-50 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => {
              const isSelected = isMulti
                ? Array.isArray(value) && value.includes(option.value)
                : value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-sm',
                    'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                    isSelected && 'bg-blue-50 text-blue-600'
                  )}
                  onClick={() => handleValueChange(option.value)}
                >
                  {isMulti && (
                    <span className="mr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                    </span>
                  )}
                  <span className="flex-1 text-left">{option.label}</span>
                  {!isMulti && isSelected && (
                    <Check className="ml-2 h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}