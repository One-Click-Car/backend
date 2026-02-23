import { NextRequest, NextResponse } from 'next/server';
import { findSemanticMatches } from '@/ai/flows/semantic-car-match';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendations, availableCars } = body;

    if (!recommendations || !Array.isArray(recommendations)) {
      return NextResponse.json(
        { error: 'Missing or invalid recommendations array' },
        { status: 400 }
      );
    }

    if (!availableCars || !Array.isArray(availableCars)) {
      return NextResponse.json(
        { error: 'Missing or invalid availableCars array' },
        { status: 400 }
      );
    }

    const result = await findSemanticMatches({
      recommendations: recommendations.map((r: any) => ({
        make: r.make,
        model: r.model,
      })),
      availableCars: availableCars.map((c: any) => ({
        id: c.id,
        make: c.make,
        model: c.model,
        description: c.description || '',
      })),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform semantic search' },
      { status: 500 }
    );
  }
}
