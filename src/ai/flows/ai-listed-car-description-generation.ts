'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating car listing descriptions.
 *
 * - generateAIListedCarDescription - A function that processes a free-form car description
 *   to extract key details and generate a compelling listing description.
 * - AIListedCarDescriptionGenerationInput - The input type for the function.
 * - AIListedCarDescriptionGenerationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the car description generation
const AIListedCarDescriptionGenerationInputSchema = z.object({
  freeformDescription: z
    .string()
    .describe(
      "A free-form text description of the car being sold (e.g., 'My trusty 2018 Honda Civic, low miles, great for city driving, minor scuffs')."
    ),
});
export type AIListedCarDescriptionGenerationInput = z.infer<
  typeof AIListedCarDescriptionGenerationInputSchema
>;

// Define the output schema for the extracted car details and generated listing description
const AIListedCarDescriptionGenerationOutputSchema = z.object({
  make: z.string().describe('The make of the car, e.g., "Honda".'),
  model: z.string().describe('The model of the car, e.g., "Civic".'),
  year: z.number().nullable().describe('The manufacturing year of the car, e.g., 2018. Output null if not specified.'),
  mileage: z.number().nullable().describe('The mileage of the car in miles, e.g., 50000. Output null if not specified or specified vaguely (e.g., "low miles").'),
  condition: z.string().describe('A summary of the car\'s condition, e.g., "Excellent", "Good with minor scuffs".'),
  color: z.string().nullable().describe('The exterior color of the car, e.g., "Red". Output null if not specified.'),
  features: z.array(z.string()).describe('A list of key features or selling points, e.g., ["low maintenance", "fuel efficient", "great for city driving"].'),
  price: z.number().nullable().describe('The asking price of the car, e.g., 15000. Output null if not specified.'),
  listingDescription: z
    .string()
    .describe('A compelling, marketing-oriented listing description for the car.'),
});
export type AIListedCarDescriptionGenerationOutput = z.infer<
  typeof AIListedCarDescriptionGenerationOutputSchema
>;

// Wrapper function to call the Genkit flow
export async function generateAIListedCarDescription(
  input: AIListedCarDescriptionGenerationInput
): Promise<AIListedCarDescriptionGenerationOutput> {
  return aiListedCarDescriptionGenerationFlow(input);
}

// Define the Genkit prompt
const aiListedCarDescriptionPrompt = ai.definePrompt({
  name: 'aiListedCarDescriptionPrompt',
  input: {schema: AIListedCarDescriptionGenerationInputSchema},
  output: {schema: AIListedCarDescriptionGenerationOutputSchema},
  prompt: `You are an expert car sales assistant. Your task is to extract key details from a free-form car description and then generate a compelling, marketing-oriented listing description.

Follow these rules:
- Extract all available information accurately.
- For 'year', 'mileage', and 'price', if the information is not explicitly provided as a numerical value, output null. Do not guess.
- For 'condition', synthesize a concise summary of the car\'s state.
- For 'features', list distinct selling points or notable attributes.
- The 'listingDescription' should be persuasive, highlighting the car\'s best attributes based on the extracted details. It should be suitable for a public car listing.

Free-form Car Description:
{{{freeformDescription}}}`,
});

// Define the Genkit flow
const aiListedCarDescriptionGenerationFlow = ai.defineFlow(
  {
    name: 'aiListedCarDescriptionGenerationFlow',
    inputSchema: AIListedCarDescriptionGenerationInputSchema,
    outputSchema: AIListedCarDescriptionGenerationOutputSchema,
  },
  async (input) => {
    const {output} = await aiListedCarDescriptionPrompt(input);
    if (!output) {
      throw new Error('Failed to generate car listing description.');
    }
    return output;
  }
);
