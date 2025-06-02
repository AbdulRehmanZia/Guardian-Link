'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { EmergencyContact } from '@/types';
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(50),
  whatsappNumber: z.string()
    .min(10, { message: 'WhatsApp number must be at least 10 digits' })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid WhatsApp number format (e.g., +1234567890)' }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  userId: string;
  existingContact?: EmergencyContact;
  onSave: (contact: EmergencyContact) => void;
  contactsCount: number;
  triggerButton?: React.ReactNode;
}

export function ContactForm({ userId, existingContact, onSave, contactsCount, triggerButton }: ContactFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: existingContact || { name: '', whatsappNumber: '' },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset(existingContact || { name: '', whatsappNumber: '' }); // Reset form on close
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    if (!existingContact && contactsCount >= 6) {
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: "You can only add up to 6 emergency contacts.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically call your backend/Firestore function
      // For now, we simulate and call onSave
      const savedContactData: EmergencyContact = {
        id: existingContact?.id || Date.now().toString(), // Use existing ID or generate one
        ...data,
      };
      onSave(savedContactData); // This will trigger the actual save in the parent component
      toast({ title: `Contact ${existingContact ? 'Updated' : 'Added'}`, description: `${data.name} has been saved.` });
      handleOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not save contact.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const defaultTrigger = (
    <Button onClick={() => handleOpenChange(true)} disabled={!existingContact && contactsCount >=6} className="gap-2">
      <PlusCircle /> Add New Contact
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {triggerButton ? 
        React.cloneElement(triggerButton as React.ReactElement, { onClick: () => handleOpenChange(true) }) : 
        defaultTrigger
      }
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{existingContact ? 'Edit' : 'Add New'} Emergency Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g., Mom, John Doe" />
            {errors.name && <p className="text-sm text-destructive pt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input id="whatsappNumber" {...register('whatsappNumber')} placeholder="e.g., +1234567890 (with country code)" />
            {errors.whatsappNumber && <p className="text-sm text-destructive pt-1">{errors.whatsappNumber.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
