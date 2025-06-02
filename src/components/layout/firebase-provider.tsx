'use client';

import React, { useEffect, useState } from 'react';
import { app } from '@/lib/firebase'; // This will ensure Firebase is initialized
import { Loader2 } from 'lucide-react';

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // The act of importing app from '@/lib/firebase' should initialize Firebase.
    // We use this effect to ensure we don't render children until Firebase is confirmed.
    if (app) {
      setInitialized(true);
    }
  }, []);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium">Initializing GuardianLink...</p>
      </div>
    );
  }

  return <>{children}</>;
};
