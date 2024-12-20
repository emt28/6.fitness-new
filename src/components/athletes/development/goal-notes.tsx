import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { GoalNote, goalNoteSchema, CreateGoalNoteData } from '@/types/development';

interface GoalNotesProps {
  notes: GoalNote[];
  onAddNote: (data: CreateGoalNoteData) => Promise<void>;
}

export function GoalNotes({ notes, onAddNote }: GoalNotesProps) {
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateGoalNoteData>({
    resolver: zodResolver(goalNoteSchema),
  });

  const onSubmit = async (data: CreateGoalNoteData) => {
    try {
      await onAddNote(data);
      reset();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-900">Notes & Updates</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Note'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <textarea
              {...register('text')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Add a note or update..."
            />
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Note'
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 p-3 rounded-lg"
          >
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{note.text}</p>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <span>{note.createdByUser?.name || 'Unknown'}</span>
                  <span className="mx-1">•</span>
                  <span>{format(new Date(note.createdAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No notes added yet
          </p>
        )}
      </div>
    </div>
  );
}