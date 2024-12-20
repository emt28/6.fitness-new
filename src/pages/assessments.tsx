import { useState } from 'react';
import { useAthletes } from '@/hooks/use-athletes';
import { AssessmentForm } from '@/components/assessments/assessment-form';
import { BatchAssessmentForm } from '@/components/assessments/batch-assessment-form';
import { AssessmentHistory } from '@/components/assessments/assessment-history';
import { TemplateManager } from '@/components/assessments/template-manager';
import { Button } from '@/components/ui/button';
import { Plus, Users, Loader2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AssessmentsPage() {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const { data: athletes, isLoading } = useAthletes();
  const { can } = usePermissions();

  const canAssess = can('manage_assessments');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
      </div>

      {canAssess && (
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList>
            <TabsTrigger value="individual">Individual Assessment</TabsTrigger>
            <TabsTrigger value="batch">Batch Assessment</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label htmlFor="athlete" className="block text-sm font-medium text-gray-700">
                    Select Athlete
                  </label>
                  <select
                    value={selectedAthleteId}
                    onChange={(e) => {
                      setSelectedAthleteId(e.target.value);
                      setShowForm(false);
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select an athlete</option>
                    {athletes?.map((athlete) => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAthleteId && (
                  <Button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 mt-6"
                  >
                    <Plus className="h-4 w-4" />
                    {showForm ? 'Cancel' : 'Record Assessment'}
                  </Button>
                )}
              </div>
            </div>

            {selectedAthleteId && (
              <div className="space-y-6">
                {showForm && (
                  <AssessmentForm
                    athleteId={selectedAthleteId}
                    onSuccess={() => setShowForm(false)}
                  />
                )}
                <AssessmentHistory athleteId={selectedAthleteId} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="batch">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <BatchAssessmentForm />
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <TemplateManager />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}