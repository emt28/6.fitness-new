import { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signOut, signUp, getCurrentUser } from '@/lib/mock-auth';
import { AuthContextType, User, UserRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const initialUser = getCurrentUser();
      setUser(initialUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user session');
    } finally {
      setIsLoading(false);
    }

    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setError(null);
      const user = await signIn(email, password);
      setUser(user);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      setError(message);
      throw new Error(message);
    }
  };

  const handleSignUp = async (email: string, password: string, role: UserRole, name: string) => {
    try {
      setError(null);
      const user = await signUp(email, password, role, name);
      setUser(user);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      setError(message);
      throw new Error(message);
    }
  };

  const handleSignOut = () => {
    try {
      signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}