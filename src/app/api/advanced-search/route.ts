/**
 * Advanced Car Search API
 * חיפוש מתקדם לפי בטיחות, מפרט ואבזור
 * 
 * POST /api/advanced-search
 */

import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { firebaseConfig } from '@/firebase/config';
import type { 
  CarDatabase, 
  CarModel, 
  CarVersion, 
  CarSearchFilters, 
  CarSearchResult 
} from '@/types/car';

// Initialize Firebase (if not already)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

/**
 * חיפוש במסד הנתונים
 */
async function searchCars(filters: CarSearchFilters): Promise<CarSearchResult[]> {
  const carsRef = ref(db, '/');
  const snapshot = await get(carsRef);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  const cars = snapshot.val() as CarDatabase;
  const results: CarSearchResult[] = [];
  
  for (const [makeName, makeData] of Object.entries(cars)) {
    // סינון לפי יצרן
    if (filters.make && !makeName.toLowerCase().includes(filters.make.toLowerCase())) {
      continue;
    }
    
    for (const [modelName, modelData] of Object.entries(makeData)) {
      let matchScore = 0;
      let isMatch = true;
      
      // סינון לפי דגם
      if (filters.model && !modelName.toLowerCase().includes(filters.model.toLowerCase())) {
        continue;
      }
      
      // סינון לפי שנים
      if (filters.yearFrom || filters.yearTo) {
        const years = modelData.years || [];
        const hasValidYear = years.some(year => {
          if (filters.yearFrom && year < filters.yearFrom) return false;
          if (filters.yearTo && year > filters.yearTo) return false;
          return true;
        });
        if (!hasValidYear) continue;
      }
      
      // סינון לפי דירוג בטיחות
      if (filters.minSafetyStars) {
        const stars = modelData.safety?.euroNcapStars || modelData.safety?.nhtsaOverall;
        if (!stars || stars < filters.minSafetyStars) {
          continue;
        }
        matchScore += stars; // ניקוד גבוה יותר לרכבים בטוחים יותר
      }
      
      // סינון לפי מפרט
      if (filters.minSeats && modelData.specs?.seats) {
        if (modelData.specs.seats < filters.minSeats) continue;
      }
      
      if (filters.maxLength && modelData.specs?.length) {
        if (modelData.specs.length > filters.maxLength) continue;
      }
      
      // סינון לפי חשמלי
      if (filters.isElectric !== undefined) {
        const hasElectricVersion = modelData.versions?.some(v => 
          v.fuelType === 'electric' || 
          v.name.toLowerCase().includes('חשמלי') ||
          v.name.toLowerCase().includes('electric')
        );
        if (filters.isElectric && !hasElectricVersion) continue;
        if (!filters.isElectric && hasElectricVersion) continue;
      }
      
      // סינון לפי טווח חשמלי
      if (filters.minRange && modelData.specs?.electricRange) {
        if (modelData.specs.electricRange < filters.minRange) continue;
      }
      
      // סינון לפי סוג דלק בגרסאות
      if (filters.fuelType) {
        const hasMatchingFuel = modelData.versions?.some(v => v.fuelType === filters.fuelType);
        if (!hasMatchingFuel) continue;
      }
      
      // סינון לפי כוחות סוס
      if (filters.minHorsePower || filters.maxHorsePower) {
        const hasMatchingPower = modelData.versions?.some(v => {
          if (filters.minHorsePower && v.horsePower < filters.minHorsePower) return false;
          if (filters.maxHorsePower && v.horsePower > filters.maxHorsePower) return false;
          return true;
        });
        if (!hasMatchingPower) continue;
      }
      
      // סינון לפי אבזור ספציפי
      if (filters.hasFeature && filters.hasFeature.length > 0) {
        const hasAllFeatures = filters.hasFeature.every(feature => {
          return modelData.versions?.some(v => {
            if (!v.features) return false;
            return checkFeature(v, feature);
          });
        });
        if (!hasAllFeatures) continue;
      }
      
      // הוספת תוצאה
      results.push({
        make: makeName,
        model: modelName,
        modelData,
        matchScore,
      });
    }
  }
  
  // מיון לפי ציון התאמה
  results.sort((a, b) => b.matchScore - a.matchScore);
  
  return results;
}

/**
 * בדיקה אם לגרסה יש אבזור מסוים
 */
function checkFeature(version: CarVersion, feature: string): boolean {
  const f = version.features;
  if (!f) return false;
  
  const featureLower = feature.toLowerCase();
  
  // Comfort
  if (featureLower.includes('חלונות חשמליים') || featureLower === 'electricwindows') {
    return f.comfort?.electricWindows === 'all';
  }
  if (featureLower.includes('סגירת חלונות') || featureLower === 'autowindowclose') {
    return f.comfort?.autoWindowClose === true;
  }
  if (featureLower.includes('מראות מתקפלות') || featureLower === 'foldingmirrors') {
    return f.comfort?.foldingMirrors === 'electric';
  }
  if (featureLower.includes('מושבים מחוממים') || featureLower === 'heatedseats') {
    return f.comfort?.heatedSeats !== 'none';
  }
  if (featureLower.includes('מושבים מאווררים') || featureLower === 'ventilatedseats') {
    return f.comfort?.ventilatedSeats !== 'none';
  }
  if (featureLower.includes('גג שמש') || featureLower === 'sunroof') {
    return f.comfort?.sunroof !== 'none';
  }
  if (featureLower.includes('גג פנורמי') || featureLower === 'panoramic') {
    return f.comfort?.sunroof === 'panoramic';
  }
  if (featureLower.includes('הגה מחומם') || featureLower === 'heatedsteeringwheel') {
    return f.comfort?.heatedSteeringWheel === true;
  }
  if (featureLower.includes('כניסה ללא מפתח') || featureLower === 'keylessentry') {
    return f.comfort?.keylessEntry === true;
  }
  
  // Safety
  if (featureLower.includes('שטח מת') || featureLower === 'blindspotmonitor') {
    return f.safety?.blindSpotMonitor === true;
  }
  if (featureLower.includes('שמירה על נתיב') || featureLower === 'lanekeepassist') {
    return f.safety?.laneKeepAssist === true;
  }
  if (featureLower.includes('שיוט אדפטיבי') || featureLower === 'adaptivecruisecontrol') {
    return f.safety?.adaptiveCruiseControl === true;
  }
  if (featureLower.includes('בלימת חירום') || featureLower === 'automaticemergencybraking') {
    return f.safety?.automaticEmergencyBraking === true;
  }
  if (featureLower.includes('מצלמה 360') || featureLower === 'camera360') {
    return f.safety?.camera360 === true;
  }
  if (featureLower.includes('תצוגה עילית') || featureLower === 'headupdisplay') {
    return f.safety?.headUpDisplay === true;
  }
  if (featureLower.includes('חיישני חניה') || featureLower === 'parkingsensors') {
    return f.safety?.parkingSensors !== 'none';
  }
  
  // Infotainment
  if (featureLower.includes('carplay') || featureLower === 'applecarplay') {
    return f.infotainment?.appleCarPlay === true;
  }
  if (featureLower.includes('android auto') || featureLower === 'androidauto') {
    return f.infotainment?.androidAuto === true;
  }
  if (featureLower.includes('טעינה אלחוטית') || featureLower === 'wirelesscharging') {
    return f.infotainment?.wirelessCharging === true;
  }
  if (featureLower.includes('ניווט') || featureLower === 'navigation') {
    return f.infotainment?.navigation === true;
  }
  
  // Driving
  if (featureLower.includes('הנעה כפולה') || featureLower === 'allwheeldrive' || featureLower === '4x4') {
    return f.driving?.allWheelDrive === true;
  }
  if (featureLower.includes('חניה אוטומטית') || featureLower === 'autopark') {
    return f.driving?.autoPark === true;
  }
  if (featureLower.includes('מתלים אדפטיביים') || featureLower === 'adaptivesuspension') {
    return f.driving?.adaptiveSuspension === true;
  }
  
  // Lighting
  if (featureLower.includes('led matrix') || featureLower === 'ledmatrix') {
    return f.lighting?.headlights === 'LED Matrix';
  }
  if (featureLower.includes('פנסי led') || featureLower === 'led') {
    return f.lighting?.headlights === 'LED' || f.lighting?.headlights === 'LED Matrix';
  }
  
  return false;
}

/**
 * POST handler
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filters: CarSearchFilters = body.filters || body;
    
    const results = await searchCars(filters);
    
    // החזרת תוצאות מצומצמות (ללא כל הנתונים)
    return NextResponse.json({
      filters,
      count: results.length,
      results: results.slice(0, 50).map(r => ({
        make: r.make,
        model: r.model,
        years: r.modelData.years,
        category: r.modelData.properties['קטגוריה'],
        safety: r.modelData.safety ? {
          stars: r.modelData.safety.euroNcapStars || r.modelData.safety.nhtsaOverall,
          year: r.modelData.safety.euroNcapYear,
        } : null,
        specs: r.modelData.specs ? {
          seats: r.modelData.specs.seats,
          trunkVolume: r.modelData.specs.trunkVolume,
          electricRange: r.modelData.specs.electricRange,
        } : null,
        versionsCount: r.modelData.versions?.length || 0,
        matchScore: r.matchScore,
      })),
    });
  } catch (error: unknown) {
    console.error('Advanced Search Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET handler - דוגמה לחיפוש
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const filters: CarSearchFilters = {};
  
  if (searchParams.get('make')) filters.make = searchParams.get('make')!;
  if (searchParams.get('model')) filters.model = searchParams.get('model')!;
  if (searchParams.get('minSafetyStars')) filters.minSafetyStars = parseInt(searchParams.get('minSafetyStars')!);
  if (searchParams.get('isElectric')) filters.isElectric = searchParams.get('isElectric') === 'true';
  if (searchParams.get('minSeats')) filters.minSeats = parseInt(searchParams.get('minSeats')!);
  if (searchParams.get('hasFeature')) filters.hasFeature = searchParams.get('hasFeature')!.split(',');
  
  const results = await searchCars(filters);
  
  return NextResponse.json({
    filters,
    count: results.length,
    results: results.slice(0, 20).map(r => ({
      make: r.make,
      model: r.model,
      category: r.modelData.properties['קטגוריה'],
      safetyStars: r.modelData.safety?.euroNcapStars,
    })),
  });
}
