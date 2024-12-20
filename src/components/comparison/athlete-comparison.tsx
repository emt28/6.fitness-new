import { useState, useMemo } from 'react';
import { ComparisonChart } from './comparison-chart';
import { ComparisonTable } from './comparison-table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useComparisonData } from '@/hooks/use-comparison-data';

const DATE_RANGES = {
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
} as const;

const DATE_RANGE_OPTIONS = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
];

export function AthleteComparison() {
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [dateRange, setDateRange] = useState<keyof typeof DATE_RANGES>('3m');

  const { data: comparisonData, athletes, protocols, isLoading } = useComparisonData(
    selectedAthletes,
    selectedProtocol,
    DATE_RANGES[dateRange]
  );

  const athleteOptions = useMemo(() => 
    athletes?.map(a => ({ value: a.id, label: a.name })) || [],
    [athletes]
  );

  const protocolOptions = useMemo(() => 
    protocols?.map(p => ({ value: p.id, label: p.name })) || [],
    [protocols]
  );

  const selectedProtocolData = useMemo(() => 
    protocols?.find(p => p.id === selectedProtocol),
    [protocols, selectedProtocol]
  );

  if (isLoading && (selectedAthletes.length > 0 || selectedProtocol)) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Compare Athletes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Athletes (up to 4)
            </label>
            <Select
              value={selectedAthletes}
              onChange={setSelectedAthletes}
              options={athleteOptions}
              placeholder="Select athletes to compare..."
              isMulti
              maxItems={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Test Protocol
            </label>
            <Select
              value={selectedProtocol}
              onChange={setSelectedProtocol}
              options={protocolOptions}
              placeholder="Select a test protocol..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {DATE_RANGE_OPTIONS.map(({ value, label }) => (
            <Button
              key={value}
              variant={dateRange === value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDateRange(value as keyof typeof DATE_RANGES)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {selectedAthletes.length > 0 && selectedProtocol && (
        <Tabs defaultValue="chart" className="space-y-6">
          <TabsList>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ComparisonChart
                data={comparisonData}
                protocol={selectedProtocolData}
              />
            </div>
          </TabsContent>

          <TabsContent value="table">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ComparisonTable
                data={comparisonData}
                protocol={selectedProtocolData}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}