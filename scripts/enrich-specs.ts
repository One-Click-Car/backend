/**
 * Specs Enrichment Script
 * סקריפט להעשרת מסד הנתונים עם מפרט טכני
 * 
 * מוסיף: מידות, משקל, נפח תא מטען, קיבולת סוללה וכו'
 * 
 * שימוש:
 *   npx tsx scripts/enrich-specs.ts [--dry-run] [--make=BMW]
 */

import { initializeFirebaseAdmin, getAdminDatabase } from './firebase-admin';
import { normalizeMakeName } from './utils/fuzzy-match';
import { 
  translateMakeToEnglish, 
  translateModelToEnglish,
  getTranslationSummary 
} from './mappings/hebrew-to-english';
import type { CarSpecs, CarDatabase } from './types/car-types';

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getAdminDatabase();

/**
 * מפרט טכני ידוע לדגמים נפוצים
 * מקור: אתרי יבואנים, מפרטים רשמיים
 */
const KNOWN_SPECS: Record<string, Record<string, CarSpecs>> = {
  'BMW': {
    'M3': {
      length: 4794,
      width: 1903,
      height: 1433,
      wheelbase: 2857,
      curbWeight: 1730,
      trunkVolume: 480,
      fuelTankCapacity: 59,
      seats: 5,
      doors: 4,
    },
    'M4': {
      length: 4794,
      width: 1887,
      height: 1393,
      wheelbase: 2857,
      curbWeight: 1725,
      trunkVolume: 440,
      fuelTankCapacity: 59,
      seats: 4,
      doors: 2,
    },
    'X5': {
      length: 4922,
      width: 2004,
      height: 1745,
      wheelbase: 2975,
      curbWeight: 2195,
      trunkVolume: 650,
      trunkVolumeMax: 1870,
      fuelTankCapacity: 80,
      seats: 5,
      doors: 5,
    },
    'iX': {
      length: 4953,
      width: 1967,
      height: 1696,
      wheelbase: 3000,
      curbWeight: 2510,
      trunkVolume: 500,
      trunkVolumeMax: 1750,
      seats: 5,
      doors: 5,
      batteryCapacity: 105.2,
      electricRange: 630,
    },
  },
  'Toyota': {
    'קורולה': {
      length: 4630,
      width: 1780,
      height: 1435,
      wheelbase: 2700,
      curbWeight: 1370,
      trunkVolume: 471,
      fuelTankCapacity: 50,
      seats: 5,
      doors: 4,
    },
    'קאמרי': {
      length: 4885,
      width: 1840,
      height: 1445,
      wheelbase: 2825,
      curbWeight: 1590,
      trunkVolume: 524,
      fuelTankCapacity: 60,
      seats: 5,
      doors: 4,
    },
    'ראב 4': {
      length: 4600,
      width: 1855,
      height: 1685,
      wheelbase: 2690,
      curbWeight: 1620,
      trunkVolume: 580,
      trunkVolumeMax: 1690,
      fuelTankCapacity: 55,
      seats: 5,
      doors: 5,
    },
    'לנד קרוזר': {
      length: 4985,
      width: 1980,
      height: 1925,
      wheelbase: 2850,
      curbWeight: 2680,
      trunkVolume: 318,
      trunkVolumeMax: 2052,
      fuelTankCapacity: 110,
      seats: 7,
      doors: 5,
    },
  },
  'Hyundai': {
    'טוסון': {
      length: 4500,
      width: 1865,
      height: 1650,
      wheelbase: 2680,
      curbWeight: 1545,
      trunkVolume: 620,
      trunkVolumeMax: 1799,
      fuelTankCapacity: 54,
      seats: 5,
      doors: 5,
    },
    'איוניק 5': {
      length: 4635,
      width: 1890,
      height: 1605,
      wheelbase: 3000,
      curbWeight: 1920,
      trunkVolume: 527,
      trunkVolumeMax: 1587,
      seats: 5,
      doors: 5,
      batteryCapacity: 77.4,
      electricRange: 481,
      chargingTimeDC: 18,
    },
    'איוניק 6': {
      length: 4855,
      width: 1880,
      height: 1495,
      wheelbase: 2950,
      curbWeight: 1985,
      trunkVolume: 401,
      seats: 5,
      doors: 4,
      batteryCapacity: 77.4,
      electricRange: 614,
      chargingTimeDC: 18,
    },
    'קונה': {
      length: 4355,
      width: 1825,
      height: 1575,
      wheelbase: 2660,
      curbWeight: 1416,
      trunkVolume: 466,
      trunkVolumeMax: 1300,
      fuelTankCapacity: 50,
      seats: 5,
      doors: 5,
    },
  },
  'Kia': {
    'ספורטאז\'': {
      length: 4515,
      width: 1865,
      height: 1650,
      wheelbase: 2680,
      curbWeight: 1556,
      trunkVolume: 591,
      trunkVolumeMax: 1780,
      fuelTankCapacity: 54,
      seats: 5,
      doors: 5,
    },
    'EV6': {
      length: 4680,
      width: 1880,
      height: 1550,
      wheelbase: 2900,
      curbWeight: 2055,
      trunkVolume: 490,
      trunkVolumeMax: 1300,
      seats: 5,
      doors: 5,
      batteryCapacity: 77.4,
      electricRange: 528,
      chargingTimeDC: 18,
    },
    'EV9': {
      length: 5010,
      width: 1980,
      height: 1755,
      wheelbase: 3100,
      curbWeight: 2575,
      trunkVolume: 333,
      trunkVolumeMax: 828,
      seats: 7,
      doors: 5,
      batteryCapacity: 99.8,
      electricRange: 541,
      chargingTimeDC: 24,
    },
  },
  'Tesla': {
    'Model 3': {
      length: 4694,
      width: 1849,
      height: 1443,
      wheelbase: 2875,
      curbWeight: 1760,
      trunkVolume: 594,
      seats: 5,
      doors: 4,
      batteryCapacity: 75,
      electricRange: 602,
      chargingTimeDC: 25,
    },
    'Model Y': {
      length: 4750,
      width: 1921,
      height: 1624,
      wheelbase: 2890,
      curbWeight: 1995,
      trunkVolume: 854,
      trunkVolumeMax: 2041,
      seats: 5,
      doors: 5,
      batteryCapacity: 75,
      electricRange: 533,
      chargingTimeDC: 27,
    },
    'Model S': {
      length: 4970,
      width: 1964,
      height: 1445,
      wheelbase: 2960,
      curbWeight: 2162,
      trunkVolume: 793,
      seats: 5,
      doors: 4,
      batteryCapacity: 100,
      electricRange: 652,
      chargingTimeDC: 35,
    },
  },
  'BYD': {
    'ATTO 3': {
      length: 4455,
      width: 1875,
      height: 1615,
      wheelbase: 2720,
      curbWeight: 1750,
      trunkVolume: 440,
      trunkVolumeMax: 1338,
      seats: 5,
      doors: 5,
      batteryCapacity: 60.5,
      electricRange: 420,
      chargingTimeDC: 29,
    },
    'Seal': {
      length: 4800,
      width: 1875,
      height: 1460,
      wheelbase: 2920,
      curbWeight: 2015,
      trunkVolume: 400,
      seats: 5,
      doors: 4,
      batteryCapacity: 82.5,
      electricRange: 570,
      chargingTimeDC: 31,
    },
    'Dolphin': {
      length: 4290,
      width: 1770,
      height: 1570,
      wheelbase: 2700,
      curbWeight: 1520,
      trunkVolume: 345,
      seats: 5,
      doors: 5,
      batteryCapacity: 60.4,
      electricRange: 427,
      chargingTimeDC: 29,
    },
  },
  'Mercedes-Benz': {
    'C-Class': {
      length: 4751,
      width: 1820,
      height: 1437,
      wheelbase: 2865,
      curbWeight: 1685,
      trunkVolume: 455,
      fuelTankCapacity: 66,
      seats: 5,
      doors: 4,
    },
    'E-Class': {
      length: 4949,
      width: 1880,
      height: 1468,
      wheelbase: 2961,
      curbWeight: 1840,
      trunkVolume: 540,
      fuelTankCapacity: 66,
      seats: 5,
      doors: 4,
    },
    'GLC': {
      length: 4716,
      width: 1890,
      height: 1640,
      wheelbase: 2888,
      curbWeight: 1915,
      trunkVolume: 620,
      trunkVolumeMax: 1640,
      fuelTankCapacity: 62,
      seats: 5,
      doors: 5,
    },
    'EQS': {
      length: 5216,
      width: 1926,
      height: 1512,
      wheelbase: 3210,
      curbWeight: 2585,
      trunkVolume: 610,
      seats: 5,
      doors: 4,
      batteryCapacity: 107.8,
      electricRange: 770,
      chargingTimeDC: 31,
    },
  },
  'Volkswagen': {
    'גולף': {
      length: 4284,
      width: 1789,
      height: 1456,
      wheelbase: 2636,
      curbWeight: 1355,
      trunkVolume: 381,
      trunkVolumeMax: 1237,
      fuelTankCapacity: 50,
      seats: 5,
      doors: 5,
    },
    'טיגואן': {
      length: 4509,
      width: 1839,
      height: 1675,
      wheelbase: 2681,
      curbWeight: 1629,
      trunkVolume: 615,
      trunkVolumeMax: 1655,
      fuelTankCapacity: 58,
      seats: 5,
      doors: 5,
    },
    'ID.4': {
      length: 4584,
      width: 1852,
      height: 1640,
      wheelbase: 2766,
      curbWeight: 2124,
      trunkVolume: 543,
      trunkVolumeMax: 1575,
      seats: 5,
      doors: 5,
      batteryCapacity: 77,
      electricRange: 520,
      chargingTimeDC: 29,
    },
  },
};

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
 * חיפוש מפרט ידוע לדגם
 */
function findKnownSpecs(make: string, model: string): CarSpecs | null {
  // תרגום שמות לאנגלית
  const translation = getTranslationSummary(make, model);
  const englishMake = translation.englishMake;
  const englishModel = translation.englishModel;
  
  // בדיקה ישירה עם שם אנגלי
  if (KNOWN_SPECS[englishMake]?.[englishModel]) {
    return KNOWN_SPECS[englishMake][englishModel];
  }
  
  // בדיקה עם שם היצרן המקורי
  if (KNOWN_SPECS[make]?.[model]) {
    return KNOWN_SPECS[make][model];
  }
  
  // נסה את כל הוריאציות של שם הדגם
  for (const modelName of translation.allModelNames) {
    if (KNOWN_SPECS[englishMake]?.[modelName]) {
      return KNOWN_SPECS[englishMake][modelName];
    }
  }
  
  // חיפוש חלקי בכל השמות
  for (const [makeName, models] of Object.entries(KNOWN_SPECS)) {
    // בדיקה אם היצרן תואם
    const makeMatches = 
      makeName.toLowerCase() === make.toLowerCase() ||
      makeName.toLowerCase() === englishMake.toLowerCase() ||
      translation.allMakeNames.some(n => n.toLowerCase() === makeName.toLowerCase());
    
    if (makeMatches) {
      for (const [knownModelName, specs] of Object.entries(models)) {
        // בדיקה אם הדגם תואם
        const modelMatches = 
          translation.allModelNames.some(n => 
            n.toLowerCase() === knownModelName.toLowerCase() ||
            n.toLowerCase().includes(knownModelName.toLowerCase()) ||
            knownModelName.toLowerCase().includes(n.toLowerCase())
          );
        
        if (modelMatches) {
          return specs;
        }
      }
    }
  }
  
  return null;
}

/**
 * עדכון מפרט טכני לדגם ספציפי
 */
async function updateModelSpecs(
  make: string,
  model: string,
  specs: CarSpecs
): Promise<boolean> {
  try {
    await db.ref(`/cars/${make}/${model}/specs`).set(specs);
    return true;
  } catch (error) {
    console.error(`Error updating specs for ${make} ${model}:`, error);
    return false;
  }
}

/**
 * הרצת ההעשרה על כל מסד הנתונים
 */
async function runEnrichment(options: {
  dryRun?: boolean;
  filterMake?: string;
}): Promise<void> {
  const { dryRun = false, filterMake } = options;
  
  console.log('🔧 Starting specs enrichment...');
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
  
  const results: Array<{ make: string; model: string; specs: CarSpecs }> = [];
  
  for (const make of makes) {
    if (filterMake && !make.toLowerCase().includes(filterMake.toLowerCase())) {
      continue;
    }
    
    const models = cars[make];
    if (!models) continue;
    
    console.log(`\n🏭 Processing ${make}...`);
    
    for (const modelName of Object.keys(models)) {
      const modelData = models[modelName];
      if (!modelData) continue;
      
      processed++;
      
      // בדיקה אם כבר יש מפרט
      if (modelData.specs?.length || modelData.specs?.width) {
        console.log(`   ⏭️  ${modelName} - already has specs`);
        continue;
      }
      
      // חיפוש מפרט ידוע
      const specs = findKnownSpecs(make, modelName);
      
      if (specs) {
        enriched++;
        results.push({ make, model: modelName, specs });
        console.log(`   ✅ ${modelName} - found specs (${specs.length}mm x ${specs.width}mm)`);
        
        if (!dryRun) {
          const success = await updateModelSpecs(make, modelName, specs);
          if (!success) {
            failed++;
            console.log(`      ❌ Failed to update Firebase`);
          }
        }
      } else {
        console.log(`   ⚠️  ${modelName} - no specs found`);
      }
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
  if (dryRun && results.length > 0) {
    const fs = await import('fs');
    const outputPath = './scripts/output/specs-enrichment-preview.json';
    
    const dir = './scripts/output';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Preview saved to: ${outputPath}`);
  }
  
  console.log('\n💡 Tip: Add more specs to KNOWN_SPECS in this file to enrich more models');
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
