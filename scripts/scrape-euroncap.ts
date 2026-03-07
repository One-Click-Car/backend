/**
 * Euro NCAP Web Scraper
 * סקריפט לגרידת נתוני בטיחות מאתר Euro NCAP
 * 
 * שימוש:
 *   npx tsx scripts/scrape-euroncap.ts --dry-run     # בדיקה בלבד
 *   npx tsx scripts/scrape-euroncap.ts               # הרצה מלאה
 *   npx tsx scripts/scrape-euroncap.ts --make=BMW    # יצרן ספציפי
 */

import * as cheerio from 'cheerio';
import { initializeFirebaseAdmin, getAdminDatabase } from './firebase-admin';
import type { EuroNCAPSafetyFeatures } from './types/car-types';
import { getTranslationSummary } from './mappings/hebrew-to-english';

const EURONCAP_SEARCH_URL = 'https://www.euroncap.com/en/ratings-rewards/latest-safety-ratings/';
const EURONCAP_BASE_URL = 'https://www.euroncap.com';

interface ScrapedSafetyData {
  euroNcapStars: number;
  euroNcapYear: number;
  euroNcapUrl: string;
  adultOccupant?: number;
  childOccupant?: number;
  pedestrian?: number;
  safetyAssist?: number;
  safetyFeatures?: EuroNCAPSafetyFeatures;
}

// Rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize Firebase
initializeFirebaseAdmin();
const db = getAdminDatabase();

/**
 * חיפוש דגם באתר Euro NCAP
 */
async function searchEuroNCAP(make: string, model: string): Promise<string | null> {
  try {
    const searchQuery = `${make} ${model}`.toLowerCase().replace(/\s+/g, '+');
    const searchUrl = `https://www.euroncap.com/en/results/?q=${encodeURIComponent(make + ' ' + model)}`;
    
    console.log(`      🔍 Searching: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      console.log(`      ❌ Search failed: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // חיפוש לינק לתוצאות
    const resultLink = $('.result-item a, .rating-result a, [class*="result"] a').first();
    if (resultLink.length > 0) {
      const href = resultLink.attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : EURONCAP_BASE_URL + href;
        console.log(`      ✅ Found result: ${fullUrl}`);
        return fullUrl;
      }
    }
    
    // ניסיון אלטרנטיבי - חיפוש לינקים שמכילים את שם הדגם
    const normalizedModel = model.toLowerCase().replace(/\s+/g, '-');
    const normalizedMake = make.toLowerCase();
    
    $('a[href*="/results/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.toLowerCase().includes(normalizedMake) && 
          (href.toLowerCase().includes(normalizedModel) || 
           href.toLowerCase().includes(model.toLowerCase().replace(/\s+/g, '')))) {
        const fullUrl = href.startsWith('http') ? href : EURONCAP_BASE_URL + href;
        console.log(`      ✅ Found via link scan: ${fullUrl}`);
        return fullUrl;
      }
    });
    
    console.log(`      ⚠️ No results found for ${make} ${model}`);
    return null;
  } catch (error) {
    console.log(`      ❌ Search error: ${error}`);
    return null;
  }
}

/**
 * ניסיון לבנות URL ישיר לדגם
 */
function buildDirectUrl(make: string, model: string): string {
  const normalizedMake = make.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const normalizedModel = model.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${EURONCAP_BASE_URL}/en/results/${normalizedMake}/${normalizedModel}/`;
}

/**
 * גרידת נתונים מדף תוצאות Euro NCAP
 */
async function scrapeResultPage(url: string): Promise<ScrapedSafetyData | null> {
  try {
    console.log(`      📄 Scraping: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });
    
    if (!response.ok) {
      console.log(`      ❌ Page load failed: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // חילוץ מספר כוכבים
    let stars = 0;
    const starsEl = $('.rating-stars, .overall-rating, [class*="star"]').first();
    const starsText = starsEl.text() || starsEl.attr('data-rating') || '';
    const starsMatch = starsText.match(/(\d)/);
    if (starsMatch) {
      stars = parseInt(starsMatch[1]);
    } else {
      // ניסיון חלופי - ספירת כוכבים מלאים
      const fullStars = $('.star.full, .star-full, [class*="star"][class*="full"]').length;
      if (fullStars > 0) {
        stars = fullStars;
      }
    }
    
    if (stars === 0) {
      // עוד ניסיון - חיפוש בטקסט
      const pageText = $('body').text();
      const starsInText = pageText.match(/(\d)\s*(?:stars?|★)/i);
      if (starsInText) {
        stars = parseInt(starsInText[1]);
      }
    }
    
    // חילוץ שנת בדיקה
    let year = new Date().getFullYear();
    const yearMatch = html.match(/tested\s*(?:in)?\s*(\d{4})|(\d{4})\s*test/i);
    if (yearMatch) {
      year = parseInt(yearMatch[1] || yearMatch[2]);
    }
    
    // חילוץ אחוזים
    const percentages: { [key: string]: number } = {};
    
    // חיפוש אחוזים בפורמטים שונים
    $('[class*="percentage"], [class*="score"], .rating-box, .category-score').each((_, el) => {
      const text = $(el).text();
      const label = $(el).prev().text() || $(el).parent().find('label, .label, h3, h4').first().text();
      const percentMatch = text.match(/(\d{1,3})%?/);
      
      if (percentMatch) {
        const value = parseInt(percentMatch[1]);
        if (value <= 100) {
          const labelLower = label.toLowerCase();
          if (labelLower.includes('adult')) {
            percentages.adultOccupant = value;
          } else if (labelLower.includes('child')) {
            percentages.childOccupant = value;
          } else if (labelLower.includes('pedestrian') || labelLower.includes('vulnerable')) {
            percentages.pedestrian = value;
          } else if (labelLower.includes('safety assist')) {
            percentages.safetyAssist = value;
          }
        }
      }
    });
    
    // חילוץ מערכות בטיחות
    const safetyFeatures: EuroNCAPSafetyFeatures = {};
    
    // חיפוש טבלת מערכות בטיחות
    $('table tr, .safety-feature, [class*="feature"]').each((_, el) => {
      const text = $(el).text().toLowerCase();
      const hasCheckmark = $(el).find('.check, .yes, [class*="green"], .available').length > 0 ||
                          text.includes('✓') || text.includes('yes') || text.includes('standard');
      const hasCross = $(el).find('.cross, .no, [class*="red"], .not-available').length > 0 ||
                       text.includes('✗') || text.includes('no') || text.includes('not');
      
      if (text.includes('active bonnet')) {
        safetyFeatures.activeBonnet = hasCheckmark && !hasCross;
      }
      if (text.includes('aeb') && text.includes('vulnerable')) {
        safetyFeatures.aebVulnerableRoadUsers = hasCheckmark && !hasCross;
      }
      if (text.includes('aeb') && text.includes('pedestrian') && text.includes('reverse')) {
        safetyFeatures.aebPedestrianReverse = hasCheckmark && !hasCross;
      }
      if (text.includes('cyclist') && text.includes('dooring')) {
        safetyFeatures.cyclistDooringPrevention = hasCheckmark && !hasCross;
      }
      if (text.includes('aeb') && text.includes('motorcyclist')) {
        safetyFeatures.aebMotorcyclist = hasCheckmark && !hasCross;
      }
      if (text.includes('aeb') && text.includes('car-to-car')) {
        safetyFeatures.aebCarToCar = hasCheckmark && !hasCross;
      }
      if (text.includes('speed assist')) {
        safetyFeatures.speedAssistance = hasCheckmark && !hasCross;
      }
      if (text.includes('lane') && (text.includes('assist') || text.includes('support'))) {
        safetyFeatures.laneAssistSystem = hasCheckmark && !hasCross;
      }
      if (text.includes('fatigue') || text.includes('distraction')) {
        safetyFeatures.fatigueDistractDetection = hasCheckmark && !hasCross;
      }
      if (text.includes('driver monitoring')) {
        safetyFeatures.driverMonitoring = hasCheckmark && !hasCross;
      }
      if (text.includes('ecall') || text.includes('e-call')) {
        safetyFeatures.eCall = hasCheckmark && !hasCross;
      }
    });
    
    if (stars === 0) {
      console.log(`      ⚠️ Could not extract stars from page`);
      return null;
    }
    
    const result: ScrapedSafetyData = {
      euroNcapStars: stars,
      euroNcapYear: year,
      euroNcapUrl: url,
      ...percentages,
    };
    
    if (Object.keys(safetyFeatures).length > 0) {
      result.safetyFeatures = safetyFeatures;
    }
    
    console.log(`      ✅ Scraped: ${stars}⭐ (${year})`);
    return result;
  } catch (error) {
    console.log(`      ❌ Scrape error: ${error}`);
    return null;
  }
}

/**
 * חיפוש וגרידה לדגם
 */
async function findAndScrapeModel(make: string, model: string): Promise<ScrapedSafetyData | null> {
  // נסה URL ישיר קודם
  const directUrl = buildDirectUrl(make, model);
  let result = await scrapeResultPage(directUrl);
  
  if (result) {
    return result;
  }
  
  // נסה חיפוש
  const searchResultUrl = await searchEuroNCAP(make, model);
  if (searchResultUrl) {
    result = await scrapeResultPage(searchResultUrl);
  }
  
  return result;
}

/**
 * עדכון Firebase
 */
async function updateModelSafety(make: string, model: string, safety: ScrapedSafetyData): Promise<boolean> {
  try {
    await db.ref(`/cars/${make}/${model}/safety`).update(safety);
    return true;
  } catch (error) {
    console.error(`Error updating ${make} ${model}:`, error);
    return false;
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const makeFilter = args.find(a => a.startsWith('--make='))?.split('=')[1];
  const delayMs = 2000; // 2 שניות בין בקשות
  
  console.log('🌐 Euro NCAP Web Scraper');
  console.log('='.repeat(50));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  if (makeFilter) console.log(`Filter: ${makeFilter}`);
  console.log('');
  
  // קריאת נתונים מ-Firebase
  const snapshot = await db.ref('/cars').once('value');
  const cars = snapshot.val();
  
  if (!cars) {
    console.log('❌ No cars found in database');
    return;
  }
  
  const makes = Object.keys(cars);
  console.log(`📊 Found ${makes.length} makes in database\n`);
  
  let processed = 0;
  let found = 0;
  let updated = 0;
  
  for (const make of makes) {
    if (makeFilter && make !== makeFilter) continue;
    
    const models = cars[make];
    if (!models) continue;
    
    console.log(`\n🏭 Processing ${make}...`);
    
    for (const modelName of Object.keys(models)) {
      const modelData = models[modelName];
      if (!modelData?.years) continue;
      
      processed++;
      
      // בדיקה אם כבר יש נתוני Euro NCAP
      if (modelData.safety?.euroNcapStars && modelData.safety?.safetyFeatures) {
        console.log(`   ⏭️  ${modelName} - already has complete Euro NCAP data`);
        continue;
      }
      
      // תרגום לאנגלית
      const translation = getTranslationSummary(make, modelName);
      const englishMake = translation.englishMake;
      const englishModel = translation.englishModel;
      
      console.log(`   🔄 ${modelName} → ${englishMake} ${englishModel}`);
      
      // חיפוש וגרידה
      const result = await findAndScrapeModel(englishMake, englishModel);
      
      if (result) {
        found++;
        console.log(`   ✅ Found: ${result.euroNcapStars}⭐ (${result.euroNcapYear})`);
        
        if (!dryRun) {
          const success = await updateModelSafety(make, modelName, result);
          if (success) {
            updated++;
          } else {
            console.log(`   ❌ Failed to update Firebase`);
          }
        }
      } else {
        console.log(`   ⚠️  No Euro NCAP data found`);
      }
      
      // Rate limiting
      await delay(delayMs);
    }
  }
  
  // סיכום
  console.log('\n' + '='.repeat(50));
  console.log('📈 SUMMARY');
  console.log(`   Processed: ${processed}`);
  console.log(`   Found:     ${found}`);
  console.log(`   Updated:   ${updated}`);
}

main().catch(console.error);
