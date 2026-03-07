/**
 * Features Enrichment Script
 * סקריפט להעשרת מסד הנתונים עם אבזור לכל גרסה
 * 
 * הסקריפט:
 * 1. עובר על כל הגרסאות ב-Firebase
 * 2. מנחש את רמת הגימור לפי שם הגרסה
 * 3. מוסיף אבזור מתאים לפי התבנית
 * 
 * שימוש:
 *   npx tsx scripts/enrich-features.ts [--dry-run] [--make=BMW]
 */

import { initializeFirebaseAdmin, getAdminDatabase } from './firebase-admin';
import { 
  getFeaturesByTrimLevel, 
  getTrimLevelForMake, 
  type TrimLevel 
} from './templates/features-template';
import type { CarDatabase, CarVersion, VersionFeatures } from './types/car-types';

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getAdminDatabase();

interface EnrichmentResult {
  make: string;
  model: string;
  versionName: string;
  trimLevel: TrimLevel;
  features: VersionFeatures;
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
 * עדכון גרסאות עם אבזור
 */
async function updateVersionsFeatures(
  make: string,
  model: string,
  versions: CarVersion[]
): Promise<boolean> {
  try {
    await db.ref(`/cars/${make}/${model}/versions`).set(versions);
    return true;
  } catch (error) {
    console.error(`Error updating versions for ${make} ${model}:`, error);
    return false;
  }
}

/**
 * העשרת גרסה בודדת
 */
function enrichVersion(
  make: string,
  version: CarVersion
): { version: CarVersion; trimLevel: TrimLevel; isNew: boolean } {
  // בדיקה אם כבר יש אבזור
  if (version.features?.comfort || version.features?.safety) {
    return { version, trimLevel: 'mid', isNew: false };
  }
  
  // ניחוש רמת גימור
  const trimLevel = getTrimLevelForMake(make, version.name);
  
  // קבלת אבזור לפי רמת הגימור
  const features = getFeaturesByTrimLevel(trimLevel);
  
  // יצירת גרסה מעודכנת
  const enrichedVersion: CarVersion = {
    ...version,
    trimLevel,
    features,
  };
  
  // ניחוש סוג דלק
  if (!version.fuelType) {
    const lowerName = version.name.toLowerCase();
    if (lowerName.includes('חשמלי') || lowerName.includes('electric') || lowerName.includes('ev')) {
      enrichedVersion.fuelType = 'electric';
    } else if (lowerName.includes('היברידי') || lowerName.includes('hybrid')) {
      if (lowerName.includes('plug-in') || lowerName.includes('phev')) {
        enrichedVersion.fuelType = 'plugin-hybrid';
      } else {
        enrichedVersion.fuelType = 'hybrid';
      }
    } else if (lowerName.includes('דיזל') || lowerName.includes('diesel') || lowerName.includes('tdi') || lowerName.includes('cdi')) {
      enrichedVersion.fuelType = 'diesel';
    } else {
      enrichedVersion.fuelType = 'petrol';
    }
  }
  
  // ניחוש תיבת הילוכים
  if (!version.transmission) {
    const lowerName = version.name.toLowerCase();
    if (lowerName.includes('אוט\'') || lowerName.includes('אוטומט') || lowerName.includes('auto') || lowerName.includes('dct') || lowerName.includes('dsg')) {
      enrichedVersion.transmission = 'automatic';
    } else if (lowerName.includes('cvt')) {
      enrichedVersion.transmission = 'cvt';
    } else {
      enrichedVersion.transmission = 'automatic'; // Default for modern cars
    }
  }
  
  return { version: enrichedVersion, trimLevel, isNew: true };
}

/**
 * הרצת ההעשרה על כל מסד הנתונים
 */
async function runEnrichment(options: {
  dryRun?: boolean;
  filterMake?: string;
}): Promise<void> {
  const { dryRun = false, filterMake } = options;
  
  console.log('🎨 Starting features enrichment...');
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
  
  let modelsProcessed = 0;
  let versionsProcessed = 0;
  let versionsEnriched = 0;
  let failed = 0;
  
  const results: EnrichmentResult[] = [];
  const trimLevelStats: Record<TrimLevel, number> = {
    basic: 0,
    mid: 0,
    high: 0,
    luxury: 0,
    sport: 0,
  };
  
  for (const make of makes) {
    if (filterMake && !make.toLowerCase().includes(filterMake.toLowerCase())) {
      continue;
    }
    
    const models = cars[make];
    if (!models) continue;
    
    console.log(`\n🏭 Processing ${make}...`);
    
    for (const modelName of Object.keys(models)) {
      const modelData = models[modelName];
      if (!modelData?.versions || !Array.isArray(modelData.versions)) continue;
      
      modelsProcessed++;
      
      const enrichedVersions: CarVersion[] = [];
      let modelHasNewFeatures = false;
      
      for (const version of modelData.versions) {
        versionsProcessed++;
        
        const { version: enrichedVersion, trimLevel, isNew } = enrichVersion(make, version);
        enrichedVersions.push(enrichedVersion);
        
        if (isNew) {
          versionsEnriched++;
          modelHasNewFeatures = true;
          trimLevelStats[trimLevel]++;
          
          results.push({
            make,
            model: modelName,
            versionName: version.name,
            trimLevel,
            features: enrichedVersion.features!,
          });
        }
      }
      
      if (modelHasNewFeatures) {
        console.log(`   ✅ ${modelName} - enriched ${enrichedVersions.length} versions`);
        
        // עדכון ב-Firebase
        if (!dryRun) {
          const success = await updateVersionsFeatures(make, modelName, enrichedVersions);
          if (!success) {
            failed++;
            console.log(`      ❌ Failed to update Firebase`);
          }
        }
      } else {
        console.log(`   ⏭️  ${modelName} - already has features`);
      }
    }
  }
  
  // סיכום
  console.log('\n' + '='.repeat(50));
  console.log('📈 SUMMARY');
  console.log('='.repeat(50));
  console.log(`   Models processed: ${modelsProcessed}`);
  console.log(`   Versions processed: ${versionsProcessed}`);
  console.log(`   Versions enriched: ${versionsEnriched}`);
  console.log('\n   Trim level distribution:');
  console.log(`      Basic:  ${trimLevelStats.basic}`);
  console.log(`      Mid:    ${trimLevelStats.mid}`);
  console.log(`      High:   ${trimLevelStats.high}`);
  console.log(`      Luxury: ${trimLevelStats.luxury}`);
  console.log(`      Sport:  ${trimLevelStats.sport}`);
  
  if (!dryRun) {
    console.log(`\n   Failed updates: ${failed}`);
  }
  
  // שמירת תוצאות לקובץ
  if (dryRun && results.length > 0) {
    const fs = await import('fs');
    const outputPath = './scripts/output/features-enrichment-preview.json';
    
    const dir = './scripts/output';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // שמירה רק של דוגמה (כי הקובץ יהיה ענק)
    const sample = results.slice(0, 50);
    fs.writeFileSync(outputPath, JSON.stringify({
      totalResults: results.length,
      sample,
    }, null, 2));
    console.log(`\n💾 Preview (first 50) saved to: ${outputPath}`);
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
