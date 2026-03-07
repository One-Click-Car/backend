/**
 * Euro NCAP Data
 * https://www.euroncap.com/
 * 
 * NOTE: Euro NCAP does not provide a public API.
 * This file is currently empty as we cannot verify data accuracy.
 * Only NHTSA data (from official API) is being used.
 */

import type { SafetyRating, EuroNCAPSafetyFeatures } from '../types/car-types';

export interface EuroNCAPResult {
  make: string;
  model: string;
  year: number;
  stars: number;
  adultOccupant: number;
  childOccupant: number;
  pedestrian: number;
  safetyAssist: number;
  url: string;
  vehicleClass: string;
  safetyFeatures?: EuroNCAPSafetyFeatures;
}

// No static data - Euro NCAP requires manual verification
export const EURONCAP_DATA_2024: EuroNCAPResult[] = [];
export const EURONCAP_DATA_2023: EuroNCAPResult[] = [];
export const ALL_EURONCAP_DATA: EuroNCAPResult[] = [];

/**
 * Find Euro NCAP rating by make and model
 */
export function findEuroNCAPRating(
  make: string,
  model: string
): EuroNCAPResult | null {
  // No data available - return null
  return null;
}

/**
 * Convert result to SafetyRating structure
 */
export function convertToSafetyRating(result: EuroNCAPResult): SafetyRating {
  const rating: SafetyRating = {
    euroNcapStars: result.stars,
    euroNcapYear: result.year,
    euroNcapUrl: result.url,
    adultOccupant: result.adultOccupant,
    childOccupant: result.childOccupant,
    pedestrian: result.pedestrian,
    safetyAssist: result.safetyAssist,
  };
  
  if (result.safetyFeatures) {
    rating.safetyFeatures = result.safetyFeatures;
  }
  
  return rating;
}

/**
 * Get Euro NCAP safety rating
 */
export function getEuroNCAPSafetyRating(
  make: string,
  model: string
): SafetyRating | null {
  const result = findEuroNCAPRating(make, model);
  if (result) {
    return convertToSafetyRating(result);
  }
  return null;
}

/**
 * Get available models for a make
 */
export function getAvailableModelsForMake(make: string): string[] {
  return [];
}

/**
 * Get all available makes
 */
export function getAvailableMakes(): string[] {
  return [];
}
