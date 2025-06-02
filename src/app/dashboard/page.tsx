'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getEmergencyContacts } from '@/lib/firestore';
import type { EmergencyContact } from '@/types';
import { HelpButtonSection } from '@/components/dashboard/help-button-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, ShieldCheck, ShieldPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchContacts(user.uid);
    } else if (user === null) { // Explicitly check if user is null (not just undefined during initial load)
        setIsLoading(false); // User is definitely not logged in
    }
  }, [user]);

  const fetchContacts = async (userId: string) => {
    setIsLoading(true);
    try {
      const userContacts = await getEmergencyContacts(userId);
      setContacts(userContacts);
    } catch (error) {
      console.error("Failed to fetch contacts for dashboard:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load contact information." });
      setContacts([]); // Assume no contacts if fetch fails, to show add contacts prompt
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading your safety dashboard...</p>
      </div>
    );
  }
  
  if (!user) { // Should be handled by layout, but as a safeguard
    return (
        <div className="container mx-auto p-4 flex flex-col justify-center items-center text-center min-h-[calc(100vh-10rem)]">
            <p className="text-xl font-semibold">Please log in to access the dashboard.</p>
            <Link href="/login">
                <Button className="mt-4">Login</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      {contacts && contacts.length > 0 ? (
        <>
          <HelpButtonSection contacts={contacts} />
           <Link href="/dashboard/contacts" className="mt-8">
            <Button variant="outline">Manage Emergency Contacts</Button>
          </Link>
        </>
      ) : (
        <div className="text-center max-w-md p-8 bg-card rounded-lg shadow-xl">
          <ShieldPlus className="h-20 w-20 text-primary mx-auto mb-6" />
          <h2 className="font-headline text-3xl font-semibold text-primary mb-4">Setup Your Safety Net</h2>
          <p className="text-muted-foreground mb-8">
            You haven't added any emergency contacts yet. Add your trusted contacts to enable the "HELP ME" feature.
          </p>
          <Link href="/dashboard/contacts">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90">Add Emergency Contacts</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
