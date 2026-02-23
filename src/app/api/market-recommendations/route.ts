
import { NextResponse } from 'next/server';
import { getMarketRecommendations } from '@/ai/flows/market-car-recommendations';

/**
 * API Route for Global Israeli Car Market Recommendations.
 * Returns a list of makes and models that fit the user's description.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'A "query" string is required in the request body.' },
        { status: 400 }
      );
    }

    // Call the AI flow to get recommendations from the general knowledge of the Israeli market
    const result = await getMarketRecommendations({ userNeeds: query });

    if (!result || !result.recommendations) {
      throw new Error('AI failed to return recommendations.');
    }

    return NextResponse.json({
      query,
      recommendations: result.recommendations
    });
  } catch (error: any) {
    console.error('Market Recommendations API Error:', error);
    // Return the actual error message for better debugging
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred during AI processing.' },
      { status: 500 }
    );
  }
}
