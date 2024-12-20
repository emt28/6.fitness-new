import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, MessageSquare } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { format } from 'date-fns';
import { CoachNote } from '@/types/note';

const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  type: z.enum(['general', 'technical', 'tactical', 'physical', 'mental']),
  visibility: z.enum(['coaches', 'all']),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface CoachNotesProps {
  athleteId: string;
  notes: CoachNote[];
  onAddNote: (data: NoteFormData) => Promise<void>;
}

export function CoachNotes({ athleteId, notes, onAddNote }: CoachNotesProps) {
  const [showForm, setShowForm] = useState(false);
  const { can } = usePermissions();
  const canAddNotes = can('manage_assessments');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      type: 'general',
      visibility: 'coaches',
    },
  });

  const onSubmit = async (data: NoteFormData) => {
    try {
      await onAddNote(data);
      reset();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Coach Notes</h3>
        {canAddNotes && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Add Note'}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Note Type
            </label>
            <select
              {...register('type')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="tactical">Tactical</option>
              <option value="physical">Physical</option>
              <option value="mental">Mental</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Visibility
            </label>
            <select
              {...register('visibility')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="coaches">Coaches Only</option>
              <option value="all">All (Including Athletes & Parents)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Note Content
            </label>
            <textarea
              {...register('content')}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Note...
              </>
            ) : (
              'Add Note'
            )}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {note.type}
                </span>
                {note.visibility === 'coaches' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Coaches Only
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(note.created), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{note.content}</p>
            <div className="mt-2 text-sm text-gray-500">
              By: {note.createdByUser?.name || 'Unknown Coach'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}