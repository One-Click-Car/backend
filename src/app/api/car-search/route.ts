
import { NextResponse } from 'next/server';
import { naturalLanguageCarSearch } from '@/ai/flows/natural-language-car-search';
import { MOCK_CARS } from '@/lib/mock-data';

/**
 * API Route Handler for Natural Language Car Search.
 * Returns the structured filters AND the matching car results.
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

    // 1. Call Genkit flow to interpret the query
    const filters = await naturalLanguageCarSearch({ 
      naturalLanguageDescription: query 
    });

    // 2. Apply the filters to the mock data
    const results = MOCK_CARS.filter(car => {
      let match = true;
      
      if (filters.make && filters.make.length > 0) {
        match = match && filters.make.some(m => car.make.toLowerCase().includes(m.toLowerCase()));
      }
      
      if (filters.model && filters.model.length > 0) {
        match = match && filters.model.some(m => car.model.toLowerCase().includes(m.toLowerCase()));
      }

      if (filters.maxPrice) {
        match = match && car.price <= filters.maxPrice;
      }
      if (filters.minPrice) {
        match = match && car.price >= filters.minPrice;
      }
      
      if (filters.bodyType && filters.bodyType.length > 0) {
        match = match && filters.bodyType.some(bt => car.bodyType.toLowerCase().includes(bt.toLowerCase()));
      }

      if (filters.fuelType && filters.fuelType.length > 0) {
        match = match && filters.fuelType.some(ft => car.fuelType.toLowerCase().includes(ft.toLowerCase()));
      }

      if (filters.color && filters.color.length > 0) {
        match = match && filters.color.some(c => car.color.toLowerCase().includes(c.toLowerCase()));
      }

      if (filters.maxMileage) {
        match = match && car.mileage <= filters.maxMileage;
      }

      if (filters.minYear) {
        match = match && car.year >= filters.minYear;
      }
      if (filters.maxYear) {
        match = match && car.year <= filters.maxYear;
      }

      return match;
    });

    // 3. Return a clean list of makes and models (or full objects)
    return NextResponse.json({
      query,
      filters,
      matchCount: results.length,
      results: results.map(car => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        imageUrl: car.imageUrl
      }))
    });
  } catch (error: any) {
    console.error('API Car Search Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
