'use server';

/**
 * @fileOverview This file defines a Genkit flow to enhance an SOS message with AI-suggested emergency service numbers.
 *
 * - enhanceSOSMessage - A function that takes user's location and distress message as input, analyzes the context using AI,
 *                       and suggests relevant emergency service numbers to include in the SOS message.
 * - EnhanceSOSMessageInput - The input type for the enhanceSOSMessage function, including location and distress message.
 * - EnhanceSOSMessageOutput - The return type for the enhanceSOSMessage function, providing the enhanced SOS message with suggested numbers.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceSOSMessageInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
  distressMessage: z.string().describe('The user-defined distress message.'),
});
export type EnhanceSOSMessageInput = z.infer<typeof EnhanceSOSMessageInputSchema>;

const EnhanceSOSMessageOutputSchema = z.object({
  enhancedMessage: z.string().describe('The enhanced SOS message with suggested emergency service numbers.'),
  suggestedNumbers: z.array(z.string()).describe('List of suggested emergency service numbers based on the distress message.'),
});
export type EnhanceSOSMessageOutput = z.infer<typeof EnhanceSOSMessageOutputSchema>;

export async function enhanceSOSMessage(input: EnhanceSOSMessageInput): Promise<EnhanceSOSMessageOutput> {
  return enhanceSOSMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceSOSMessagePrompt',
  input: {schema: EnhanceSOSMessageInputSchema},
  output: {schema: EnhanceSOSMessageOutputSchema},
  prompt: `You are an AI assistant designed to enhance SOS messages by suggesting relevant emergency service numbers.

  The user is currently at latitude: {{latitude}} and longitude: {{longitude}}.
  Their distress message is: {{distressMessage}}.

  Analyze the location and the content of the distress message to determine the most appropriate emergency services to contact.
  Consider potential scenarios based on the message and location (e.g., medical emergency, police assistance, fire hazard).

  Suggest relevant emergency service numbers (e.g., police, fire, ambulance, coast guard) that should be included in the SOS message.
  Return the suggested numbers as a list of strings, and incorporate them into the enhanced message.

  Ensure the enhanced message is clear, concise, and includes the suggested emergency service numbers.

  Output format:
  {
    "enhancedMessage": "The enhanced SOS message with suggested numbers.",
    "suggestedNumbers": ["Emergency service numbers"]
  }
  `,
});

const enhanceSOSMessageFlow = ai.defineFlow(
  {
    name: 'enhanceSOSMessageFlow',
    inputSchema: EnhanceSOSMessageInputSchema,
    outputSchema: EnhanceSOSMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
