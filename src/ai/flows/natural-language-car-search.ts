
'use server';
/**
 * @fileOverview A Genkit flow that interprets natural language car descriptions
 * and translates them into structured car search queries.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageCarSearchInputSchema = z.object({
  naturalLanguageDescription: z
    .string()
    .describe(
      'A natural language description of the desired car, e.g., "a spacious family SUV with good mileage under $30,000".'
    ),
});
export type NaturalLanguageCarSearchInput = z.infer<
  typeof NaturalLanguageCarSearchInputSchema
>;

const NaturalLanguageCarSearchOutputSchema = z.object({
  make: z.array(z.string()).optional().describe('List of desired car makes.'),
  model: z.array(z.string()).optional().describe('List of desired car models.'),
  minYear: z.number().optional().describe('Minimum manufacturing year.'),
  maxYear: z.number().optional().describe('Maximum manufacturing year.'),
  minPrice: z.number().optional().describe('Minimum price in USD.'),
  maxPrice: z.number().optional().describe('Maximum price in USD.'),
  bodyType: z.array(z.string()).optional().describe('List of desired car body types, e.g., SUV, Sedan, Truck.'),
  features: z.array(z.string()).optional().describe('List of desired car features, e.g., "good mileage", "leather seats", "panoramic sunroof".'),
  minMileage: z.number().optional().describe('Minimum mileage in miles.'),
  maxMileage: z.number().optional().describe('Maximum mileage in miles.'),
  color: z.array(z.string()).optional().describe('List of desired car colors.'),
  fuelType: z.array(z.string()).optional().describe('List of desired fuel types, e.g., Gasoline, Electric, Hybrid.'),
});
export type NaturalLanguageCarSearchOutput = z.infer<
  typeof NaturalLanguageCarSearchOutputSchema
>;

export async function naturalLanguageCarSearch(
  input: NaturalLanguageCarSearchInput
): Promise<NaturalLanguageCarSearchOutput> {
  return naturalLanguageCarSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageCarSearchPrompt',
  input: {schema: NaturalLanguageCarSearchInputSchema},
  output: {schema: NaturalLanguageCarSearchOutputSchema},
  prompt: `You are an intelligent car search assistant. Your task is to extract car preferences from a natural language description and convert them into a structured JSON object suitable for a car listing search.

Be as precise as possible in interpreting the user's request. If a specific detail is not mentioned, omit the field from the output JSON. For features, try to list specific keywords.

Natural Language Description: {{{naturalLanguageDescription}}}`,
});

const naturalLanguageCarSearchFlow = ai.defineFlow(
  {
    name: 'naturalLanguageCarSearchFlow',
    inputSchema: NaturalLanguageCarSearchInputSchema,
    outputSchema: NaturalLanguageCarSearchOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
