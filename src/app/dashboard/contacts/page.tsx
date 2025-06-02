'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '@/lib/firestore';
import type { EmergencyContact } from '@/types';
import { ContactForm } from '@/components/dashboard/contact-form';
import { ContactListItem } from '@/components/dashboard/contact-list-item';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ShieldAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchContacts(user.uid);
    } else {
      setIsLoading(false); // Not logged in or user object not ready
    }
  }, [user]);

  const fetchContacts = async (userId: string) => {
    setIsLoading(true);
    try {
      const userContacts = await getEmergencyContacts(userId);
      setContacts(userContacts);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load contacts." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = async (contactData: EmergencyContact) => {
    if (!user?.uid) return;
    
    try {
      if (contactData.id) { // Existing contact
        await updateEmergencyContact(user.uid, contactData.id, contactData);
        setContacts(prev => prev.map(c => c.id === contactData.id ? contactData : c));
      } else { // New contact
        const newContact = await addEmergencyContact(user.uid, { name: contactData.name, whatsappNumber: contactData.whatsappNumber });
        setContacts(prev => [...prev, newContact]);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Save Error', description: error.message || "Could not save contact." });
      // Re-fetch to ensure consistency if save failed partially or if limit error was from DB side
      fetchContacts(user.uid);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user?.uid) return;
    try {
      await deleteEmergencyContact(user.uid, contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast({ title: "Contact Deleted", description: "The contact has been removed." });
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete contact." });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-4 sm:mb-0">
          <Users className="inline-block h-10 w-10 mr-3 align-bottom" />
          Emergency Contacts
        </h1>
        {user && (
          <ContactForm 
            userId={user.uid} 
            onSave={handleSaveContact} 
            contactsCount={contacts.length} 
          />
        )}
      </div>

      {contacts.length === 0 && !isLoading && (
        <div className="text-center py-10 bg-card border border-dashed rounded-lg p-8">
          <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-medium text-foreground mb-2">No Emergency Contacts Yet</p>
          <p className="text-muted-foreground mb-6">
            Add your trusted contacts who will be notified in an emergency. You can add up to 6 contacts.
          </p>
          {user && (
            <ContactForm 
                userId={user.uid} 
                onSave={handleSaveContact} 
                contactsCount={contacts.length} 
            />
          )}
        </div>
      )}

      {contacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map(contact => (
            <ContactListItem
              key={contact.id}
              userId={user!.uid}
              contact={contact}
              onUpdate={handleSaveContact}
              onDelete={handleDeleteContact}
              contactsCount={contacts.length}
            />
          ))}
        </div>
      )}
       {contacts.length > 0 && (
         <div className="mt-12 text-center">
            <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Go to SOS Page
                </Button>
            </Link>
        </div>
       )}
    </div>
  );
}
