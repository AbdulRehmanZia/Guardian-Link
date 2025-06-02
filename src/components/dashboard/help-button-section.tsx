'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { EmergencyContact } from '@/types';
import { enhanceSOSMessage, EnhanceSOSMessageInput } from '@/ai/flows/enhance-sos-message';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface HelpButtonSectionProps {
  contacts: EmergencyContact[];
}

export function HelpButtonSection({ contacts }: HelpButtonSectionProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const defaultDistressMessage = "⚠️ I’m in danger. Please help me!";

  const handleHelpRequest = async () => {
    if (!user || contacts.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in or no contacts available.' });
      return;
    }

    setIsLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0 // Force fresh location
        });
      });

      const { latitude, longitude } = position.coords;
      const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      
      setIsAiProcessing(true);
      let finalMessage = `${defaultDistressMessage} My current location: ${mapLink}`;
      let suggestedNumbersText = "";

      try {
        const aiInput: EnhanceSOSMessageInput = {
          latitude,
          longitude,
          distressMessage: defaultDistressMessage,
        };
        const aiOutput = await enhanceSOSMessage(aiInput);
        
        finalMessage = aiOutput.enhancedMessage; // Use AI enhanced message
        if (!finalMessage.includes(mapLink)) { // Ensure map link is there if AI didn't add it
             finalMessage += ` My current location: ${mapLink}`;
        }

        if (aiOutput.suggestedNumbers && aiOutput.suggestedNumbers.length > 0) {
          suggestedNumbersText = ` Suggested emergency numbers: ${aiOutput.suggestedNumbers.join(', ')}`;
          finalMessage += suggestedNumbersText;
        }
        toast({ title: "AI Enhancement Complete", description: "SOS message refined with AI suggestions." });
      } catch (aiError: any) {
        console.error("AI enhancement failed:", aiError);
        toast({ variant: "destructive", title: "AI Enhancement Failed", description: "Using default message. " + (aiError.message || "Could not connect to AI service.") });
        // Fallback to default message with location if AI fails
         finalMessage = `${defaultDistressMessage} My current location: ${mapLink}`;
      } finally {
        setIsAiProcessing(false);
      }

      const encodedMessage = encodeURIComponent(finalMessage);

      contacts.forEach(contact => {
        // Remove non-digits from WhatsApp number, keep leading +
        const cleanNumber = contact.whatsappNumber.startsWith('+') ? '+' + contact.whatsappNumber.substring(1).replace(/\D/g, '') : contact.whatsappNumber.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      });

      toast({
        title: 'SOS Sent!',
        description: 'Your emergency message is being opened in WhatsApp for each contact.',
        duration: 10000,
      });

    } catch (error: any) {
      console.error('Error sending help request:', error);
      let errorMessage = 'Could not send help request.';
      if (error.code === 1) errorMessage = 'Location access denied. Please enable location services.';
      else if (error.code === 2) errorMessage = 'Location unavailable. Please check your connection or signal.';
      else if (error.code === 3) errorMessage = 'Location request timed out. Please try again.';
      
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
      setIsLoading(false);
      setIsAiProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto text-center shadow-xl">
        <CardHeader>
            <ShieldAlert className="mx-auto h-20 w-20 text-accent animate-pulse" />
            <CardTitle className="font-headline text-4xl text-primary mt-4">Emergency SOS</CardTitle>
            <CardDescription className="text-lg mt-2">
                Press the button below to immediately notify your emergency contacts.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
            <Button
                onClick={handleHelpRequest}
                disabled={isLoading || isAiProcessing}
                className="w-full h-24 text-3xl font-bold bg-accent text-accent-foreground hover:bg-accent/90 transform active:scale-95 transition-transform duration-150 ease-in-out"
                aria-label="Send Help Request"
            >
                {isLoading || isAiProcessing ? (
                <>
                    <Loader2 className="mr-4 h-10 w-10 animate-spin" />
                    {isAiProcessing ? 'AI Processing...' : 'Sending...'}
                </>
                ) : (
                'HELP ME!'
                )}
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">
                This will attempt to open WhatsApp with a pre-filled message for each of your emergency contacts.
                It will include your current location and an AI-enhanced distress message.
            </p>
        </CardContent>
    </Card>
  );
}
