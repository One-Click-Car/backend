'use server';
/**
 * @fileOverview A Genkit flow that performs semantic matching between 
 * AI recommendations and database cars (handles Hebrew/English differences).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SemanticMatchInputSchema = z.object({
  recommendations: z.array(z.object({
    make: z.string(),
    model: z.string(),
  })).describe('List of recommended car makes and models from the AI advisor.'),
  availableCars: z.array(z.object({
    id: z.string(),
    make: z.string(),
    model: z.string(),
    description: z.string().optional(),
  })).describe('List of cars available in the database (may be in Hebrew or English).'),
});
export type SemanticMatchInput = z.infer<typeof SemanticMatchInputSchema>;

const SemanticMatchOutputSchema = z.object({
  matchedIds: z.array(z.string()).describe('List of car IDs from the database that match the recommendations.'),
});
export type SemanticMatchOutput = z.infer<typeof SemanticMatchOutputSchema>;

export async function findSemanticMatches(input: SemanticMatchInput): Promise<SemanticMatchOutput> {
  return semanticMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'semanticCarMatchPrompt',
  input: {schema: SemanticMatchInputSchema},
  output: {schema: SemanticMatchOutputSchema},
  prompt: `You are an expert at matching car names across languages (Hebrew, English, etc.).

Your task: Find which cars from the available database match the AI recommendations.

## Important Rules:
- Match semantically, not just by exact text
- "טויוטה" = "Toyota", "קורולה" = "Corolla", "מאזדה" = "Mazda", etc.
- Model names might be slightly different: "RAV4" = "ראב 4" = "RAV 4"
- If a car is the same make AND similar model, it's a match
- Return ONLY the IDs of matching cars
- If no matches found, return empty array

## AI Recommendations (what we're looking for):
{{#each recommendations}}
- {{make}} {{model}}
{{/each}}

## Available Cars in Database:
{{#each availableCars}}
- ID: {{id}} | Make: {{make}} | Model: {{model}}{{#if description}} | Description: {{description}}{{/if}}
{{/each}}

Return the IDs of all database cars that match any of the recommendations.`,
});

const semanticMatchFlow = ai.defineFlow(
  {
    name: 'semanticCarMatchFlow',
    inputSchema: SemanticMatchInputSchema,
    outputSchema: SemanticMatchOutputSchema,
  },
  async (input) => {
    if (input.availableCars.length === 0) {
      return { matchedIds: [] };
    }
    
    const {output} = await prompt(input);
    if (!output) {
      return { matchedIds: [] };
    }
    return output;
  }
);
