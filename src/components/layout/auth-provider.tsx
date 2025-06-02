'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signUpWithEmail, signInWithEmail, signOutUser as firebaseSignOutUser } from '@/lib/auth';
import type { User } from '@/types';
import type { AuthContextType } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await signUpWithEmail(email, password);
      setUser(newUser); // Firebase onAuthStateChanged will also update this, but set it here for immediate feedback
      return newUser;
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const signedInUser = await signInWithEmail(email, password);
      setUser(signedInUser); // Firebase onAuthStateChanged will also update this
      return signedInUser;
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const signOutUser = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOutUser();
      setUser(null); // Firebase onAuthStateChanged will also update this
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };


  if (loading && typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/signup' || window.location.pathname === '/')) {
     // Don't show full page loader for auth pages or initial redirect page
  } else if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
