import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { Button } from './button';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  date?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  maxDate?: Date;
}

export function DatePicker({ date, onChange, disabled, maxDate }: DatePickerProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-gray-500'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : 'Pick a date'}
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-auto p-0 bg-white rounded-md shadow-lg"
          align="start"
        >
          <DayPicker
            mode="single"
            selected={date}
            onSelect={onChange}
            disabled={{ after: maxDate || new Date() }}
            className="p-3"
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}