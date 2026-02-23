
'use server';
/**
 * @fileOverview A Genkit flow that acts as an expert on the Israeli car market.
 * It recommends specific makes and models available in Israel based on a user's needs.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketRecommendationsInputSchema = z.object({
  userNeeds: z.string().describe('A description of what the user is looking for in a car, e.g., "a safe SUV for a large family with low fuel consumption".'),
});
export type MarketRecommendationsInput = z.infer<typeof MarketRecommendationsInputSchema>;

const MarketRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.object({
    make: z.string().describe('The car manufacturer, e.g., "Toyota".'),
    model: z.string().describe('The specific model name, e.g., "RAV4 Hybrid".'),
    reasoning: z.string().describe('A short explanation of why this car fits the user\'s needs in the Israeli context.'),
    category: z.string().describe('The segment of the car, e.g., "Family SUV", "City Car", etc.')
  })).describe('A list of recommended cars available in the Israeli market.')
});
export type MarketRecommendationsOutput = z.infer<typeof MarketRecommendationsOutputSchema>;

export async function getMarketRecommendations(input: MarketRecommendationsInput): Promise<MarketRecommendationsOutput> {
  return marketRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketRecommendationsPrompt',
  input: {schema: MarketRecommendationsInputSchema},
  output: {schema: MarketRecommendationsOutputSchema},
  prompt: `You are a senior automotive consultant specializing in the Israeli car market. 
Your task is to recommend a list of specific car makes and models that are officially sold in Israel and best match the user's requirements.

Take into account:
- Reliability and commonality in Israel.
- Fuel efficiency or electric range (important in Israel).
- Resale value (Mahiron Yitzhak Levi context).
- Suitability for Israeli roads and climate.

Return a diverse but relevant list of at least 5-15 recommendations.

User Requirements: {{{userNeeds}}}`,
});

const marketRecommendationsFlow = ai.defineFlow(
  {
    name: 'marketRecommendationsFlow',
    inputSchema: MarketRecommendationsInputSchema,
    outputSchema: MarketRecommendationsOutputSchema,
  },
  async (input) => {
    // Explicitly using the model identifier to ensure v1beta compatibility
    const {output} = await prompt(input);
    if (!output) throw new Error("Failed to generate recommendations.");
    return output;
  }
);
