'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getMarketRecommendations } from '@/ai/flows/market-car-recommendations';
import { findSemanticMatches } from '@/ai/flows/semantic-car-match';
import { firebaseConfig } from '@/firebase/config';

async function fetchSellData(): Promise<any> {
  // Use Firebase REST API with API key for authentication
  const url = `${firebaseConfig.databaseURL}/carRequests/sell.json?auth=${firebaseConfig.apiKey}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firebase fetch failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

interface DbCarRecord {
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'A "query" string is required in the request body.' },
        { status: 400 }
      );
    }

    // Step 1: Get AI recommendations
    const recommendationsResult = await getMarketRecommendations({ userNeeds: query });

    if (!recommendationsResult || !recommendationsResult.recommendations) {
      throw new Error('AI failed to return recommendations.');
    }

    const recommendations = recommendationsResult.recommendations;

    // Step 2: Read all cars from Realtime Database using Admin SDK
    const sellData = await fetchSellData();

    if (!sellData) {
      return NextResponse.json({
        query,
        recommendations,
        matchedCars: [],
        message: 'No cars found in database'
      });
    }

    // Parse the nested structure: sell/{userId}/{carId}
    const allCars: DbCarRecord[] = [];

    for (const userId of Object.keys(sellData)) {
      const userCars = sellData[userId];
      if (typeof userCars !== 'object' || userCars === null) continue;
      
      for (const carId of Object.keys(userCars)) {
        const carData = userCars[carId];
        if (typeof carData !== 'object' || carData === null) continue;
        
        allCars.push({
          ...carData,
          id: carId,
          userId: userId,
        });
      }
    }

    if (allCars.length === 0) {
      return NextResponse.json({
        query,
        recommendations,
        matchedCars: [],
        message: 'No cars found in database'
      });
    }

    // Step 3: Semantic matching with AI
    const semanticResult = await findSemanticMatches({
      recommendations: recommendations.map(r => ({ make: r.make, model: r.model })),
      availableCars: allCars.map(c => ({
        id: c.id,
        make: (c.carCompany || []).join(' '),
        model: (c.carModel || []).join(' '),
        description: `${(c.carCompany || []).join(' ')} ${(c.carModel || []).join(' ')} ${(c.carYear || []).join(' ')} ${c.area || ''}`
      })),
    });

    const matchedIds = semanticResult.matchedIds || [];
    
    // Return full car records for matched IDs
    const matchedCars = allCars.filter(car => matchedIds.includes(car.id));

    return NextResponse.json({
      query,
      recommendations,
      matchedCars
    });

  } catch (error: any) {
    console.error('Smart Search API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
