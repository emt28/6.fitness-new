export type UserRole = 'admin' | 'lead_coach' | 'fitness_trainer' | 'player' | 'academy_coach' | 'parent';

export interface UserAssignment {
  userId: string;
  athleteId: string;
  role: 'coach' | 'parent' | 'fitness_trainer';
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created: string;
  updated: string;
  isActive?: boolean;
  assignments?: UserAssignment[];
  preferences?: {
    emailNotifications: boolean;
    reportUpdates: boolean;
    attendanceAlerts: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<User>;
  signOut: () => void;
}