import { AthleteComparison } from '@/components/comparison/athlete-comparison';

export function ComparisonPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Athlete Comparison</h1>
      </div>

      <AthleteComparison />
    </div>
  );
}