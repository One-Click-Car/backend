/**
 * Safety Enrichment Script - Full Version
 * סקריפט להעשרת כל הדגמים ב-Firebase עם נתוני בטיחות
 * 
 * מקורות:
 * - NHTSA API (עובד - נתונים אמריקאיים)
 * - Euro NCAP Static Data (נתונים סטטיים שהוספנו)
 * 
 * שימוש:
 *   npx tsx scripts/enrich-all-safety.ts --dry-run
 *   npx tsx scripts/enrich-all-safety.ts
 *   npx tsx scripts/enrich-all-safety.ts --make=BMW
 */

import { initializeFirebaseAdmin, getAdminDatabase } from './firebase-admin';
import { getEuroNCAPSafetyRating } from './sources/euroncap';
import { getFullSafetyRating, delay } from './sources/nhtsa';
import { getTranslationSummary } from './mappings/hebrew-to-english';
import type { SafetyRating, CarDatabase } from './types/car-types';

// Initialize Firebase
initializeFirebaseAdmin();
const db = getAdminDatabase();

/**
 * הסרת שדות undefined
 */
function removeUndefinedFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

/**
 * מיזוג דירוגים מ-Euro NCAP ו-NHTSA
 */
function mergeSafetyRatings(
  euroNcap: SafetyRating | null,
  nhtsa: Partial<SafetyRating> | null
): Partial<SafetyRating> | null {
  if (!euroNcap && !nhtsa) return null;
  
  const merged = {
    // Euro NCAP
    euroNcapStars: euroNcap?.euroNcapStars,
    euroNcapYear: euroNcap?.euroNcapYear,
    euroNcapUrl: euroNcap?.euroNcapUrl,
    adultOccupant: euroNcap?.adultOccupant,
    childOccupant: euroNcap?.childOccupant,
    pedestrian: euroNcap?.pedestrian,
    safetyAssist: euroNcap?.safetyAssist,
    safetyFeatures: euroNcap?.safetyFeatures,
    
    // NHTSA
    nhtsaOverall: nhtsa?.nhtsaOverall,
    nhtsaFrontalCrash: nhtsa?.nhtsaFrontalCrash,
    nhtsaSideCrash: nhtsa?.nhtsaSideCrash,
    nhtsaRollover: nhtsa?.nhtsaRollover,
  };
  
  return removeUndefinedFields(merged) as Partial<SafetyRating>;
}

/**
 * עדכון Firebase - משתמש ב-update לא set
 */
async function updateModelSafety(
  make: string,
  model: string,
  safety: Partial<SafetyRating>
): Promise<boolean> {
  try {
    if (Object.keys(safety).length === 0) {
      return false;
    }
    await db.ref(`/cars/${make}/${model}/safety`).update(safety);
    return true;
  } catch (error) {
    console.error(`Error updating ${make} ${model}:`, error);
    return false;
  }
}

/**
 * העשרת דגם בודד
 */
async function enrichModel(
  make: string,
  model: string,
  years: number[],
  existingSafety?: Partial<SafetyRating>
): Promise<{
  euroNcap: SafetyRating | null;
  nhtsa: Partial<SafetyRating> | null;
  merged: Partial<SafetyRating> | null;
}> {
  const translation = getTranslationSummary(make, model);
  const englishMake = translation.englishMake;
  const englishModel = translation.englishModel;
  
  console.log(`      🔄 Searching as: ${englishMake} ${englishModel}`);
  
  // Euro NCAP - רק אם אין כבר
  let euroNcap: SafetyRating | null = null;
  if (!existingSafety?.euroNcapStars) {
    euroNcap = getEuroNCAPSafetyRating(englishMake, englishModel);
    
    if (!euroNcap) {
      for (const modelName of translation.allModelNames) {
        if (modelName !== englishModel) {
          euroNcap = getEuroNCAPSafetyRating(englishMake, modelName);
          if (euroNcap) break;
        }
      }
    }
  }
  
  // NHTSA - רק אם אין כבר
  let nhtsa: Partial<SafetyRating> | null = null;
  if (!existingSafety?.nhtsaOverall) {
    const latestYear = Math.max(...years);
    
    if (latestYear >= 2011) {
      try {
        let nhtsaResult = await getFullSafetyRating(englishMake, englishModel, latestYear);
        
        if (!nhtsaResult) {
          for (const modelName of translation.allModelNames) {
            if (modelName !== englishModel) {
              nhtsaResult = await getFullSafetyRating(englishMake, modelName, latestYear);
              if (nhtsaResult) break;
            }
          }
        }
        
        if (nhtsaResult && nhtsaResult.nhtsaOverall !== null) {
          nhtsa = {};
          if (nhtsaResult.nhtsaOverall !== null) nhtsa.nhtsaOverall = nhtsaResult.nhtsaOverall;
          if (nhtsaResult.nhtsaFrontalCrash !== null) nhtsa.nhtsaFrontalCrash = nhtsaResult.nhtsaFrontalCrash;
          if (nhtsaResult.nhtsaSideCrash !== null) nhtsa.nhtsaSideCrash = nhtsaResult.nhtsaSideCrash;
          if (nhtsaResult.nhtsaRollover !== null) nhtsa.nhtsaRollover = nhtsaResult.nhtsaRollover;
        }
      } catch (error) {
        // NHTSA might not have this model
      }
    }
  }
  
  const merged = mergeSafetyRatings(euroNcap, nhtsa);
  
  return { euroNcap, nhtsa, merged };
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const makeFilter = args.find(a => a.startsWith('--make='))?.split('=')[1];
  const delayMs = 500;
  
  console.log('🚗 Safety Enrichment Script');
  console.log('='.repeat(50));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  if (makeFilter) console.log(`Filter: ${makeFilter}`);
  console.log('');
  
  // קריאת נתונים מ-Firebase
  const snapshot = await db.ref('/cars').once('value');
  const cars = snapshot.val() as CarDatabase;
  
  if (!cars) {
    console.log('❌ No cars found in database');
    return;
  }
  
  const makes = Object.keys(cars);
  console.log(`📊 Found ${makes.length} makes in database\n`);
  
  let processed = 0;
  let enriched = 0;
  let skipped = 0;
  
  for (const make of makes) {
    if (makeFilter && make !== makeFilter) continue;
    
    const models = cars[make];
    if (!models) continue;
    
    console.log(`\n🏭 Processing ${make}...`);
    
    for (const modelName of Object.keys(models)) {
      const modelData = models[modelName];
      if (!modelData?.years) continue;
      
      processed++;
      
      const existingSafety = modelData.safety;
      const hasEuroNcap = existingSafety?.euroNcapStars !== undefined;
      const hasNhtsa = existingSafety?.nhtsaOverall !== undefined;
      
      // אם יש הכל - דלג
      if (hasEuroNcap && hasNhtsa) {
        console.log(`   ⏭️  ${modelName} - complete`);
        skipped++;
        continue;
      }
      
      // מה חסר?
      const missing: string[] = [];
      if (!hasEuroNcap) missing.push('Euro NCAP');
      if (!hasNhtsa) missing.push('NHTSA');
      console.log(`   🔍 ${modelName} - looking for: ${missing.join(', ')}`);
      
      // העשרה
      const result = await enrichModel(make, modelName, modelData.years, existingSafety);
      
      if (result.merged && Object.keys(result.merged).length > 0) {
        enriched++;
        
        if (result.euroNcap) {
          console.log(`      ✅ Euro NCAP: ${result.euroNcap.euroNcapStars}⭐ (${result.euroNcap.euroNcapYear})`);
        }
        if (result.nhtsa?.nhtsaOverall) {
          console.log(`      ✅ NHTSA: ${result.nhtsa.nhtsaOverall}⭐`);
        }
        
        if (!dryRun) {
          const success = await updateModelSafety(make, modelName, result.merged);
          if (!success) {
            console.log(`      ❌ Failed to update Firebase`);
          }
        }
      } else {
        console.log(`      ⚠️  No new data found`);
      }
      
      await delay(delayMs);
    }
  }
  
  // סיכום
  console.log('\n' + '='.repeat(50));
  console.log('📈 SUMMARY');
  console.log(`   Processed: ${processed}`);
  console.log(`   Enriched:  ${enriched}`);
  console.log(`   Skipped:   ${skipped}`);
  console.log(`   Mode:      ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
}

main().catch(console.error);
