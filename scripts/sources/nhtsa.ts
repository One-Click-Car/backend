/**
 * NHTSA API Client
 * משיכת נתוני בטיחות מה-API של NHTSA (ארה"ב)
 * https://vpic.nhtsa.dot.gov/api/
 */

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const SAFETY_RATINGS_URL = 'https://api.nhtsa.gov/SafetyRatings';

export interface NHTSAVehicle {
  VehicleId: number;
  VehicleDescription: string;
  ModelYear: number;
  Make: string;
  Model: string;
}

export interface NHTSASafetyRating {
  VehicleId: number;
  OverallRating: string;
  OverallFrontCrashRating: string;
  FrontCrashDriversideRating: string;
  FrontCrashPassengersideRating: string;
  OverallSideCrashRating: string;
  SideCrashDriversideRating: string;
  SideCrashPassengersideRating: string;
  RolloverRating: string;
  SidePoleCrashRating: string;
  NHTSAForwardCollisionWarning: string;
  NHTSALaneDepartureWarning: string;
  ComplaintsCount: number;
  RecallsCount: number;
  InvestigationCount: number;
  ModelYear: number;
  Make: string;
  Model: string;
  VehicleDescription: string;
  VehiclePicture?: string;
  FrontCrashPicture?: string;
  SideCrashPicture?: string;
  SidePolePicture?: string;
}

/**
 * קבלת רשימת שנים זמינות
 */
export async function getAvailableYears(): Promise<number[]> {
  try {
    const response = await fetch(`${SAFETY_RATINGS_URL}?format=json`);
    const data = await response.json();
    
    if (data.Results) {
      return data.Results.map((r: { ModelYear: number }) => r.ModelYear).sort((a: number, b: number) => b - a);
    }
    return [];
  } catch (error) {
    console.error('Error fetching NHTSA years:', error);
    return [];
  }
}

/**
 * קבלת רשימת יצרנים לשנה מסוימת
 */
export async function getMakesByYear(year: number): Promise<string[]> {
  try {
    const response = await fetch(`${SAFETY_RATINGS_URL}/modelyear/${year}?format=json`);
    const data = await response.json();
    
    if (data.Results) {
      return data.Results.map((r: { Make: string }) => r.Make);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching NHTSA makes for ${year}:`, error);
    return [];
  }
}

/**
 * קבלת רשימת דגמים ליצרן ושנה
 */
export async function getModelsByMakeAndYear(make: string, year: number): Promise<string[]> {
  try {
    const response = await fetch(
      `${SAFETY_RATINGS_URL}/modelyear/${year}/make/${encodeURIComponent(make)}?format=json`
    );
    const data = await response.json();
    
    if (data.Results) {
      return data.Results.map((r: { Model: string }) => r.Model);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching NHTSA models for ${make} ${year}:`, error);
    return [];
  }
}

/**
 * קבלת גרסאות רכב עם Vehicle IDs
 */
export async function getVehicleVariants(
  make: string,
  model: string,
  year: number
): Promise<NHTSAVehicle[]> {
  try {
    const response = await fetch(
      `${SAFETY_RATINGS_URL}/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}?format=json`
    );
    const data = await response.json();
    
    if (data.Results) {
      return data.Results;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching NHTSA variants for ${make} ${model} ${year}:`, error);
    return [];
  }
}

/**
 * קבלת דירוג בטיחות לפי Vehicle ID
 */
export async function getSafetyRatingById(vehicleId: number): Promise<NHTSASafetyRating | null> {
  try {
    const response = await fetch(`${SAFETY_RATINGS_URL}/VehicleId/${vehicleId}?format=json`);
    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      return data.Results[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching NHTSA safety rating for vehicle ${vehicleId}:`, error);
    return null;
  }
}

/**
 * המרת דירוג NHTSA למבנה שלנו
 */
export function parseNHTSARating(rating: string): number | null {
  if (rating === 'Not Rated' || !rating) {
    return null;
  }
  const num = parseInt(rating, 10);
  return isNaN(num) ? null : num;
}

/**
 * קבלת דירוג בטיחות מלא לרכב
 */
export async function getFullSafetyRating(
  make: string,
  model: string,
  year: number
): Promise<{
  nhtsaOverall: number | null;
  nhtsaFrontalCrash: number | null;
  nhtsaSideCrash: number | null;
  nhtsaRollover: number | null;
  vehicleId: number | null;
} | null> {
  try {
    // מקבל את הגרסאות
    const variants = await getVehicleVariants(make, model, year);
    
    if (variants.length === 0) {
      return null;
    }
    
    // לוקח את הגרסה הראשונה (בדרך כלל הבסיסית)
    const vehicleId = variants[0].VehicleId;
    const rating = await getSafetyRatingById(vehicleId);
    
    if (!rating) {
      return null;
    }
    
    return {
      nhtsaOverall: parseNHTSARating(rating.OverallRating),
      nhtsaFrontalCrash: parseNHTSARating(rating.OverallFrontCrashRating),
      nhtsaSideCrash: parseNHTSARating(rating.OverallSideCrashRating),
      nhtsaRollover: parseNHTSARating(rating.RolloverRating),
      vehicleId,
    };
  } catch (error) {
    console.error(`Error getting full safety rating for ${make} ${model} ${year}:`, error);
    return null;
  }
}

/**
 * קבלת כל המידע על רכב מ-VIN
 */
export async function decodeVIN(vin: string): Promise<Record<string, string> | null> {
  try {
    const response = await fetch(
      `${NHTSA_BASE_URL}/DecodeVinValues/${vin}?format=json`
    );
    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      return data.Results[0];
    }
    return null;
  } catch (error) {
    console.error(`Error decoding VIN ${vin}:`, error);
    return null;
  }
}

/**
 * חיפוש כל היצרנים הזמינים
 */
export async function getAllMakes(): Promise<Array<{ Make_ID: number; Make_Name: string }>> {
  try {
    const response = await fetch(`${NHTSA_BASE_URL}/GetAllMakes?format=json`);
    const data = await response.json();
    
    if (data.Results) {
      return data.Results;
    }
    return [];
  } catch (error) {
    console.error('Error fetching all makes:', error);
    return [];
  }
}

// Rate limiting helper
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * קבלת דירוגי בטיחות עם rate limiting
 */
export async function getSafetyRatingsWithRateLimit(
  vehicles: Array<{ make: string; model: string; year: number }>,
  delayMs = 200
): Promise<Map<string, ReturnType<typeof getFullSafetyRating>>> {
  const results = new Map<string, ReturnType<typeof getFullSafetyRating>>();
  
  for (const vehicle of vehicles) {
    const key = `${vehicle.make}|${vehicle.model}|${vehicle.year}`;
    const rating = await getFullSafetyRating(vehicle.make, vehicle.model, vehicle.year);
    results.set(key, Promise.resolve(rating));
    
    await delay(delayMs);
  }
  
  return results;
}
