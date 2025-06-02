'use client';

import type { EmergencyContact } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ContactForm } from './contact-form';
import { Trash2, Edit3, User, Phone } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ContactListItemProps {
  userId: string;
  contact: EmergencyContact;
  onUpdate: (updatedContact: EmergencyContact) => void;
  onDelete: (contactId: string) => void;
  contactsCount: number;
}

export function ContactListItem({ userId, contact, onUpdate, onDelete, contactsCount }: ContactListItemProps) {
  
  const editTriggerButton = (
    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700">
      <Edit3 className="h-5 w-5" />
      <span className="sr-only">Edit Contact</span>
    </Button>
  );

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl text-primary flex items-center gap-2">
              <User className="h-5 w-5"/> {contact.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
              <Phone className="h-4 w-4 text-muted-foreground" /> {contact.whatsappNumber}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <ContactForm 
              userId={userId} 
              existingContact={contact} 
              onSave={onUpdate} 
              contactsCount={contactsCount}
              triggerButton={editTriggerButton}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Delete Contact</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {contact.name} from your emergency contacts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(contact.id!)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
