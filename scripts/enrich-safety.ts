/**
 * Safety Enrichment Script
 * סקריפט להעשרת מסד הנתונים עם דירוגי בטיחות
 * 
 * מקורות:
 * - Euro NCAP (אירופה)
 * - NHTSA (ארה"ב)
 * 
 * שימוש:
 *   npx tsx scripts/enrich-safety.ts [--dry-run] [--make=BMW]
 */

import { initializeFirebaseAdmin, getAdminDatabase } from './firebase-admin';
import { getEuroNCAPSafetyRating } from './sources/euroncap';
import { getFullSafetyRating, delay } from './sources/nhtsa';
import { normalizeMakeName } from './utils/fuzzy-match';
import { 
  translateMakeToEnglish, 
  translateModelToEnglish,
  getTranslationSummary 
} from './mappings/hebrew-to-english';
import type { SafetyRating, CarDatabase } from './types/car-types';

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getAdminDatabase();

interface EnrichmentResult {
  make: string;
  model: string;
  euroNcap: SafetyRating | null;
  nhtsa: Partial<SafetyRating> | null;
  merged: Partial<SafetyRating> | null;
}

/**
 * הסרת שדות עם ערך undefined מאובייקט
 * Firebase לא מקבל undefined - רק null או ערכים ממשיים
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
    // Euro NCAP (עדיפות ראשונה - רלוונטי יותר לישראל)
    euroNcapStars: euroNcap?.euroNcapStars,
    euroNcapYear: euroNcap?.euroNcapYear,
    euroNcapUrl: euroNcap?.euroNcapUrl,
    adultOccupant: euroNcap?.adultOccupant,
    childOccupant: euroNcap?.childOccupant,
    pedestrian: euroNcap?.pedestrian,
    safetyAssist: euroNcap?.safetyAssist,
    
    // NHTSA (משלים)
    nhtsaOverall: nhtsa?.nhtsaOverall,
    nhtsaFrontalCrash: nhtsa?.nhtsaFrontalCrash,
    nhtsaSideCrash: nhtsa?.nhtsaSideCrash,
    nhtsaRollover: nhtsa?.nhtsaRollover,
  };
  
  // הסר שדות undefined לפני שליחה ל-Firebase
  return removeUndefinedFields(merged);
}

/**
 * קבלת נתוני הרכבים הקיימים מ-Firebase
 */
async function getExistingCars(): Promise<CarDatabase | null> {
  try {
    const snapshot = await db.ref('/cars').once('value');
    
    if (snapshot.exists()) {
      return snapshot.val() as CarDatabase;
    }
    return null;
  } catch (error) {
    console.error('Error fetching cars from Firebase:', error);
    return null;
  }
}

/**
 * עדכון דירוג בטיחות לדגם ספציפי
 * משתמש ב-update כדי למזג עם נתונים קיימים (לא לדרוס)
 */
async function updateModelSafety(
  make: string,
  model: string,
  safety: Partial<SafetyRating>
): Promise<boolean> {
  try {
    // וודא שאין שדות ריקים
    if (Object.keys(safety).length === 0) {
      console.log(`      ⚠️  No valid safety data to save`);
      return false;
    }
    // שימוש ב-update במקום set - כדי למזג עם נתונים קיימים
    await db.ref(`/cars/${make}/${model}/safety`).update(safety);
    return true;
  } catch (error) {
    console.error(`Error updating safety for ${make} ${model}:`, error);
    return false;
  }
}

/**
 * העשרת דגם בודד
 */
async function enrichModel(
  make: string,
  model: string,
  years: number[]
): Promise<EnrichmentResult> {
  // תרגום שמות לאנגלית לחיפוש ב-APIs
  const translation = getTranslationSummary(make, model);
  const englishMake = translation.englishMake;
  const englishModel = translation.englishModel;
  
  console.log(`      🔄 Searching as: ${englishMake} ${englishModel}`);
  
  // ניסיון למצוא ב-Euro NCAP (עם כל השמות האפשריים)
  let euroNcap: SafetyRating | null = null;
  
  // נסה עם השם באנגלית קודם
  euroNcap = getEuroNCAPSafetyRating(englishMake, englishModel);
  
  // אם לא נמצא, נסה עם שמות נוספים
  if (!euroNcap) {
    for (const modelName of translation.allModelNames) {
      if (modelName !== englishModel) {
        euroNcap = getEuroNCAPSafetyRating(englishMake, modelName);
        if (euroNcap) break;
      }
    }
  }
  
  // ניסיון למצוא ב-NHTSA (לוקח את השנה האחרונה)
  let nhtsa: Partial<SafetyRating> | null = null;
  const latestYear = Math.max(...years);
  
  if (latestYear >= 2011) { // NHTSA has data from 2011+
    try {
      // נסה עם השם באנגלית
      let nhtsaResult = await getFullSafetyRating(englishMake, englishModel, latestYear);
      
      // אם לא נמצא, נסה עם שמות נוספים
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
  
  const merged = mergeSafetyRatings(euroNcap, nhtsa);
  
  return {
    make,
    model,
    euroNcap,
    nhtsa,
    merged,
  };
}

/**
 * הרצת ההעשרה על כל מסד הנתונים
 */
async function runEnrichment(options: {
  dryRun?: boolean;
  filterMake?: string;
  delayMs?: number;
}): Promise<void> {
  const { dryRun = false, filterMake, delayMs = 300 } = options;
  
  console.log('🚗 Starting safety enrichment...');
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  if (filterMake) console.log(`   Filter: ${filterMake}`);
  
  // קבלת הנתונים הקיימים
  const cars = await getExistingCars();
  if (!cars) {
    console.error('❌ Failed to fetch cars from Firebase');
    return;
  }
  
  const makes = Object.keys(cars);
  console.log(`📊 Found ${makes.length} makes in database`);
  
  let processed = 0;
  let enriched = 0;
  let failed = 0;
  
  const results: EnrichmentResult[] = [];
  
  for (const make of makes) {
    // סינון לפי יצרן אם צריך
    if (filterMake && !make.toLowerCase().includes(filterMake.toLowerCase())) {
      continue;
    }
    
    const models = cars[make];
    if (!models) continue;
    
    console.log(`\n🏭 Processing ${make}...`);
    
    for (const modelName of Object.keys(models)) {
      const modelData = models[modelName];
      if (!modelData?.years) continue;
      
      processed++;
      
      // בדיקה אם כבר יש דירוג בטיחות מלא (גם Euro NCAP וגם NHTSA)
      const hasEuroNcap = modelData.safety?.euroNcapStars !== undefined;
      const hasNhtsa = modelData.safety?.nhtsaOverall !== undefined;
      const hasSafetyFeatures = modelData.safety?.safetyFeatures !== undefined;
      
      if (hasEuroNcap && hasNhtsa && hasSafetyFeatures) {
        console.log(`   ⏭️  ${modelName} - already has complete safety data`);
        continue;
      }
      
      // נציין מה חסר
      const missing: string[] = [];
      if (!hasEuroNcap) missing.push('Euro NCAP');
      if (!hasNhtsa) missing.push('NHTSA');
      if (!hasSafetyFeatures) missing.push('safetyFeatures');
      if (missing.length > 0) {
        console.log(`   🔍 ${modelName} - looking for: ${missing.join(', ')}`);
      }
      
      // העשרה
      const result = await enrichModel(make, modelName, modelData.years);
      results.push(result);
      
      if (result.merged) {
        enriched++;
        console.log(`   ✅ ${modelName} - found safety data`);
        
        if (result.euroNcap) {
          console.log(`      Euro NCAP: ${result.euroNcap.euroNcapStars}⭐ (${result.euroNcap.euroNcapYear})`);
        }
        if (result.nhtsa?.nhtsaOverall) {
          console.log(`      NHTSA: ${result.nhtsa.nhtsaOverall}⭐`);
        }
        
        // עדכון ב-Firebase (אם לא dry run)
        if (!dryRun) {
          const success = await updateModelSafety(make, modelName, result.merged);
          if (!success) {
            failed++;
            console.log(`      ❌ Failed to update Firebase`);
          }
        }
      } else {
        console.log(`   ⚠️  ${modelName} - no safety data found`);
      }
      
      // Rate limiting
      await delay(delayMs);
    }
  }
  
  // סיכום
  console.log('\n' + '='.repeat(50));
  console.log('📈 SUMMARY');
  console.log('='.repeat(50));
  console.log(`   Total processed: ${processed}`);
  console.log(`   Enriched: ${enriched}`);
  console.log(`   No data found: ${processed - enriched}`);
  if (!dryRun) {
    console.log(`   Failed updates: ${failed}`);
  }
  
  // שמירת תוצאות לקובץ
  if (dryRun) {
    const fs = await import('fs');
    const outputPath = './scripts/output/safety-enrichment-preview.json';
    
    // יצירת תיקייה אם לא קיימת
    const dir = './scripts/output';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify(results.filter(r => r.merged), null, 2)
    );
    console.log(`\n💾 Preview saved to: ${outputPath}`);
  }
}

// CLI
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const makeArg = args.find(a => a.startsWith('--make='));
const filterMake = makeArg ? makeArg.split('=')[1] : undefined;

runEnrichment({ dryRun, filterMake })
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
