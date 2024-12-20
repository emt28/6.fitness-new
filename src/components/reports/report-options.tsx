import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown } from 'lucide-react';

interface ReportOptionsProps {
  onGenerate: (options: ReportOptions) => void;
  isLoading?: boolean;
}

export interface ReportOptions {
  includePerformance: boolean;
  includeAttendance: boolean;
  includeTrainingLog: boolean;
  dateRange: '1m' | '3m' | '6m' | '1y';
}

export function ReportOptions({ onGenerate, isLoading }: ReportOptionsProps) {
  const [options, setOptions] = useState<ReportOptions>({
    includePerformance: true,
    includeAttendance: true,
    includeTrainingLog: true,
    dateRange: '3m',
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Report Options</h3>

      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.includePerformance}
            onCheckedChange={(checked) => 
              setOptions(prev => ({ ...prev, includePerformance: checked as boolean }))
            }
          />
          <span className="text-sm text-gray-700">Include Performance Metrics</span>
        </label>

        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.includeAttendance}
            onCheckedChange={(checked) => 
              setOptions(prev => ({ ...prev, includeAttendance: checked as boolean }))
            }
          />
          <span className="text-sm text-gray-700">Include Attendance Records</span>
        </label>

        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.includeTrainingLog}
            onCheckedChange={(checked) => 
              setOptions(prev => ({ ...prev, includeTrainingLog: checked as boolean }))
            }
          />
          <span className="text-sm text-gray-700">Include Training Logs</span>
        </label>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '1m', label: '1 Month' },
              { value: '3m', label: '3 Months' },
              { value: '6m', label: '6 Months' },
              { value: '1y', label: '1 Year' },
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={options.dateRange === value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setOptions(prev => ({ ...prev, dateRange: value as ReportOptions['dateRange'] }))}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={() => onGenerate(options)}
        disabled={isLoading || !Object.values(options).some(Boolean)}
        className="w-full flex items-center justify-center"
      >
        <FileDown className="h-4 w-4 mr-2" />
        {isLoading ? 'Generating Report...' : 'Generate Report'}
      </Button>
    </div>
  );
}