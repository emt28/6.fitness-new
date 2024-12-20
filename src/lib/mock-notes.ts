import { CoachNote } from '@/types/note';
import { getCurrentUser } from './mock-auth';

let notes: CoachNote[] = [];

export async function getNotes(athleteId: string): Promise<CoachNote[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return notes.filter(note => note.athleteId === athleteId);
}

export async function createNote(athleteId: string, data: {
  content: string;
  type: CoachNote['type'];
  visibility: CoachNote['visibility'];
}): Promise<CoachNote> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to create notes');
  }

  const newNote: CoachNote = {
    id: String(notes.length + 1),
    athleteId,
    content: data.content,
    type: data.type,
    visibility: data.visibility,
    createdBy: user.id,
    createdByUser: user,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  notes = [...notes, newNote];
  return newNote;
}