import type { User } from '@/types';
import { useContext } from 'react';
import { AuthContext } from '@/components/layout/auth-provider';


export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string) => Promise<User>
  signIn: (email: string, password: string) => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
