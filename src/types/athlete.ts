export interface Athlete {
  id: string;
  name: string;
  dateOfBirth: string;
  dominantHand: 'left' | 'right' | 'ambidextrous';
  wtn: number;
  createdBy: string;
  created: string;
  updated: string;
}

export interface CreateAthleteData {
  name: string;
  dateOfBirth: string;
  dominantHand: 'left' | 'right' | 'ambidextrous';
  wtn: number;
}