import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAthletes } from '@/hooks/use-athletes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { calculateAge } from '@/lib/utils';
import { AthleteForm } from '@/components/athletes/athlete-form';
import { AthleteProfile } from '@/components/athletes/athlete-profile';
import { CoachNotes } from '@/components/athletes/coach-notes';
import { usePermissions } from '@/hooks/use-permissions';
import { useAthleteNotes, useCreateNote } from '@/hooks/use-notes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AthleteDetailsPage() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const { data: athletes } = useAthletes();
  const { data: notes } = useAthleteNotes(athleteId!);
  const createNote = useCreateNote();
  const [showEditForm, setShowEditForm] = useState(false);
  const { can } = usePermissions();

  const athlete = athletes?.find(a => a.id === athleteId);
  const canViewCoachNotes = can('manage_assessments');

  if (!athlete) {
    return <div>Athlete not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/athletes')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Athletes
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{athlete.name}</h1>
        </div>
        <Button
          onClick={() => setShowEditForm(!showEditForm)}
          className="flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          {showEditForm ? 'Cancel Edit' : 'Edit Athlete'}
        </Button>
      </div>

      {showEditForm ? (
        <AthleteForm athlete={athlete} onSuccess={() => setShowEditForm(false)} />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Athlete Information</h2>
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Age</dt>
                <dd className="text-lg text-gray-900">{calculateAge(athlete.dateOfBirth)} years</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="text-lg text-gray-900">
                  {new Date(athlete.dateOfBirth).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Dominant Hand</dt>
                <dd className="text-lg text-gray-900 capitalize">{athlete.dominantHand}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">World Tennis Number (WTN)</dt>
                <dd className="text-lg text-gray-900">{athlete.wtn}</dd>
              </div>
            </dl>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {canViewCoachNotes && <TabsTrigger value="notes">Coach Notes</TabsTrigger>}
            </TabsList>

            <TabsContent value="profile">
              <AthleteProfile athlete={athlete} />
            </TabsContent>

            {canViewCoachNotes && (
              <TabsContent value="notes">
                <CoachNotes
                  athleteId={athlete.id}
                  notes={notes || []}
                  onAddNote={async (data) => {
                    await createNote.mutateAsync({
                      athleteId: athlete.id,
                      data,
                    });
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}