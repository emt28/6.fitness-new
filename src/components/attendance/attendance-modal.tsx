import { useState } from 'react';
import { format, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { FitnessSession } from '@/types/attendance';
import { useAthletes } from '@/hooks/use-athletes';
import { useAttendance } from '@/hooks/use-attendance';
import { useSessionFeedback, useFeedbackTemplates } from '@/hooks/use-feedback';
import { AttendanceForm } from './attendance-form';
import { SessionFeedbackForm } from './session-feedback';
import { FeedbackTemplateForm } from './feedback-template-form';
import { FeedbackTemplateList } from './feedback-template-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AttendanceModalProps {
  session: FitnessSession;
  onClose: () => void;
}

export function AttendanceModal({ session, onClose }: AttendanceModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const { data: athletes } = useAthletes();
  const { data: attendance } = useAttendance(session.id);
  const { data: feedback } = useSessionFeedback(session.id);
  const { data: templates } = useFeedbackTemplates();

  // Get the registered athletes for this session
  const registeredAthletes = athletes?.filter(
    athlete => session.selectedAthletes?.includes(athlete.id)
  ) || [];

  const handleFeedbackSuccess = () => {
    setSuccess('Session feedback saved and training logs updated for all attending athletes.');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {session.name}
              </h2>
              <p className="text-sm text-gray-500">
                {format(new Date(session.date), 'MMMM d, yyyy')} •{' '}
                {format(parse(session.startTime, 'HH:mm', new Date()), 'h:mm a')} -{' '}
                {format(parse(session.endTime, 'HH:mm', new Date()), 'h:mm a')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
              {success}
            </div>
          )}

          <Tabs defaultValue="attendance" className="space-y-6">
            <TabsList>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="feedback">Session Feedback</TabsTrigger>
              <TabsTrigger value="templates">Feedback Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance">
              {registeredAthletes.length > 0 ? (
                <AttendanceForm
                  session={session}
                  date={new Date(session.date)}
                  registeredAthletes={registeredAthletes}
                  attendance={attendance || []}
                />
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No athletes registered for this session
                </p>
              )}
            </TabsContent>

            <TabsContent value="feedback">
              <SessionFeedbackForm
                session={session}
                existingFeedback={feedback || undefined}
                onSuccess={handleFeedbackSuccess}
                templates={templates || []}
              />
            </TabsContent>

            <TabsContent value="templates">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Feedback Templates</h3>
                  <Button
                    onClick={() => setShowTemplateForm(!showTemplateForm)}
                  >
                    {showTemplateForm ? 'Cancel' : 'Create Template'}
                  </Button>
                </div>

                {showTemplateForm ? (
                  <FeedbackTemplateForm
                    onSuccess={() => {
                      setShowTemplateForm(false);
                      setSuccess('Template created successfully');
                    }}
                    onCancel={() => setShowTemplateForm(false)}
                  />
                ) : (
                  <FeedbackTemplateList
                    templates={templates || []}
                    onSelect={(template) => {
                      // Switch to feedback tab and pre-fill form
                      const feedbackTab = document.querySelector('[data-value="feedback"]');
                      if (feedbackTab instanceof HTMLElement) {
                        feedbackTab.click();
                      }
                    }}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}