/**
 * Hebrew to English Translation Module
 * מודול תרגום מעברית לאנגלית לשמות מכוניות
 */

import {
  translateTermsInString,
  detectTransmission,
  detectFuelType,
  detectBodyType,
  detectDriveType,
  TRIM_LEVELS_COMMON,
} from './common-terms';

import {
  findEnglishModelName,
  findEnglishModelNameFuzzy,
  getAllModelNames,
  MODEL_ALIASES,
} from './model-aliases';

import { normalizeMakeName, MAKE_ALIASES } from '../utils/fuzzy-match';

// Re-export for convenience
export { findEnglishModelName, findEnglishModelNameFuzzy, getAllModelNames };
export { translateTermsInString, detectTransmission, detectFuelType, detectBodyType, detectDriveType };
export { normalizeMakeName };

/**
 * מבנה מידע מפורש מתוך שם גרסה
 */
export interface ParsedVersionInfo {
  make: string | null;
  model: string | null;
  engineSize: string | null;
  horsePower: number | null;
  transmission: string | null;
  fuelType: string | null;
  driveType: string | null;
  trimLevel: string | null;
  bodyType: string | null;
  year: number | null;
  rawParts: string[];
}

/**
 * מיפוי שמות יצרנים מעברית לאנגלית (הפוך מ-MAKE_ALIASES)
 */
const HEBREW_TO_ENGLISH_MAKES: Record<string, string> = {};

// בנה את המיפוי ההפוך
for (const [english, hebrewAliases] of Object.entries(MAKE_ALIASES)) {
  for (const hebrew of hebrewAliases) {
    HEBREW_TO_ENGLISH_MAKES[hebrew.toLowerCase()] = english;
  }
}

/**
 * תרגום שם יצרן מעברית לאנגלית
 */
export function translateMakeToEnglish(hebrewMake: string): string {
  const normalized = hebrewMake.trim().toLowerCase();
  
  // בדיקה אם כבר באנגלית
  if (MAKE_ALIASES[hebrewMake]) {
    return hebrewMake;
  }
  
  // חיפוש במיפוי
  if (HEBREW_TO_ENGLISH_MAKES[normalized]) {
    return HEBREW_TO_ENGLISH_MAKES[normalized];
  }
  
  // נסה נרמול
  return normalizeMakeName(hebrewMake);
}

/**
 * תרגום שם דגם מעברית לאנגלית
 */
export function translateModelToEnglish(make: string, hebrewModel: string): string {
  // נרמל את היצרן קודם
  const normalizedMake = translateMakeToEnglish(make);
  
  // חפש התאמה
  const englishModel = findEnglishModelNameFuzzy(normalizedMake, hebrewModel);
  if (englishModel) {
    return englishModel;
  }
  
  // אם לא נמצא - החזר את המקורי עם תרגום מונחים
  return translateTermsInString(hebrewModel);
}

/**
 * תרגום שם גרסה מלא לאנגלית
 */
export function translateVersionToEnglish(
  make: string,
  model: string,
  versionName: string
): string {
  // נרמל יצרן
  const englishMake = translateMakeToEnglish(make);
  
  // נרמל דגם
  const englishModel = translateModelToEnglish(englishMake, model);
  
  // תרגם מונחים בשם הגרסה
  let translated = translateTermsInString(versionName);
  
  // החלף את שם היצרן העברי בשם האנגלי
  for (const [eng, hebrewAliases] of Object.entries(MAKE_ALIASES)) {
    for (const hebrew of hebrewAliases) {
      const regex = new RegExp(hebrew.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translated = translated.replace(regex, eng);
    }
  }
  
  return translated;
}

/**
 * חילוץ נפח מנוע מתוך מחרוזת
 * דוגמאות: "2.0 ל'", "1998 סמ"ק", "3.0L"
 */
function extractEngineSize(text: string): string | null {
  // חפש נפח בליטרים
  const literMatch = text.match(/(\d+\.?\d*)\s*(?:ל'|ליטר|L)/i);
  if (literMatch) {
    return `${literMatch[1]}L`;
  }
  
  // חפש נפח בסמ"ק (המר לליטרים)
  const ccMatch = text.match(/(\d{3,4})\s*(?:סמ"ק|cc)/i);
  if (ccMatch) {
    const liters = (parseInt(ccMatch[1]) / 1000).toFixed(1);
    return `${liters}L`;
  }
  
  // חפש מספר 4 ספרות שעשוי להיות נפח מנוע
  const volumeMatch = text.match(/\b([1-9]\d{3})\b/);
  if (volumeMatch) {
    const cc = parseInt(volumeMatch[1]);
    if (cc >= 800 && cc <= 8000) {
      const liters = (cc / 1000).toFixed(1);
      return `${liters}L`;
    }
  }
  
  return null;
}

/**
 * חילוץ כוח סוס מתוך מחרוזת
 */
function extractHorsePower(text: string): number | null {
  const match = text.match(/(\d{2,4})\s*(?:כ"ס|כוח סוס|HP|hp|PS|ps)/i);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

/**
 * חילוץ רמת גימור מתוך מחרוזת
 */
function extractTrimLevel(text: string): string | null {
  for (const trim of TRIM_LEVELS_COMMON) {
    const regex = new RegExp(`\\b${trim}\\b`, 'i');
    if (regex.test(text)) {
      return trim;
    }
  }
  return null;
}

/**
 * חילוץ שנה מתוך מחרוזת
 */
function extractYear(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  if (match) {
    return parseInt(match[0]);
  }
  return null;
}

/**
 * פירוק שם גרסה למרכיבים
 * דוגמה: "ב.מ.וו 220i גראן טורר 2.0 ל' טורבו, אוט', Luxury"
 */
export function parseVersionName(versionName: string): ParsedVersionInfo {
  const result: ParsedVersionInfo = {
    make: null,
    model: null,
    engineSize: null,
    horsePower: null,
    transmission: null,
    fuelType: null,
    driveType: null,
    trimLevel: null,
    bodyType: null,
    year: null,
    rawParts: [],
  };
  
  // פיצול לפי פסיקים
  const parts = versionName.split(',').map(p => p.trim());
  result.rawParts = parts;
  
  // חלק ראשון בד"כ מכיל יצרן + דגם
  if (parts.length > 0) {
    const firstPart = parts[0];
    
    // נסה לזהות יצרן
    for (const [english, hebrewAliases] of Object.entries(MAKE_ALIASES)) {
      const allNames = [english, ...hebrewAliases];
      for (const name of allNames) {
        if (firstPart.toLowerCase().includes(name.toLowerCase())) {
          result.make = english;
          break;
        }
      }
      if (result.make) break;
    }
    
    // נסה לחלץ מודל אם מצאנו יצרן
    if (result.make) {
      const makeModels = MODEL_ALIASES[result.make];
      if (makeModels) {
        for (const [englishModel, hebrewAliases] of Object.entries(makeModels)) {
          const allModelNames = [englishModel, ...hebrewAliases];
          for (const modelName of allModelNames) {
            if (firstPart.toLowerCase().includes(modelName.toLowerCase())) {
              result.model = englishModel;
              break;
            }
          }
          if (result.model) break;
        }
      }
    }
  }
  
  // חילוץ מידע מכל המחרוזת
  result.engineSize = extractEngineSize(versionName);
  result.horsePower = extractHorsePower(versionName);
  result.transmission = detectTransmission(versionName);
  result.fuelType = detectFuelType(versionName);
  result.driveType = detectDriveType(versionName);
  result.trimLevel = extractTrimLevel(versionName);
  result.bodyType = detectBodyType(versionName);
  result.year = extractYear(versionName);
  
  return result;
}

/**
 * יצירת שם גרסה מנורמל לחיפוש ב-API
 * מחזיר שם פשוט יותר שיתאים לחיפוש
 */
export function createSearchableName(
  make: string,
  model: string,
  versionName?: string
): { make: string; model: string; variant?: string } {
  const englishMake = translateMakeToEnglish(make);
  const englishModel = translateModelToEnglish(englishMake, model);
  
  let variant: string | undefined;
  
  if (versionName) {
    const parsed = parseVersionName(versionName);
    
    // בנה variant מהמידע שחולץ
    const variantParts: string[] = [];
    
    if (parsed.engineSize) {
      variantParts.push(parsed.engineSize);
    }
    if (parsed.fuelType && parsed.fuelType !== 'Gasoline') {
      variantParts.push(parsed.fuelType);
    }
    if (parsed.trimLevel) {
      variantParts.push(parsed.trimLevel);
    }
    
    if (variantParts.length > 0) {
      variant = variantParts.join(' ');
    }
  }
  
  return {
    make: englishMake,
    model: englishModel,
    variant,
  };
}

/**
 * בדיקה אם מחרוזת מכילה עברית
 */
export function containsHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

/**
 * הסרת תווים עבריים ממחרוזת
 */
export function removeHebrew(text: string): string {
  return text.replace(/[\u0590-\u05FF]+/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * יצירת מפתח ייחודי לרכב (לצורך מיפוי)
 */
export function createCarKey(make: string, model: string): string {
  const englishMake = translateMakeToEnglish(make);
  const englishModel = translateModelToEnglish(englishMake, model);
  return `${englishMake}|${englishModel}`.toLowerCase();
}

/**
 * סיכום מידע תרגום לרכב
 */
export interface TranslationSummary {
  originalMake: string;
  originalModel: string;
  englishMake: string;
  englishModel: string;
  allMakeNames: string[];
  allModelNames: string[];
  searchKey: string;
}

/**
 * יצירת סיכום תרגום מלא לרכב
 */
export function getTranslationSummary(make: string, model: string): TranslationSummary {
  const englishMake = translateMakeToEnglish(make);
  const englishModel = translateModelToEnglish(englishMake, model);
  
  const allMakeNames = [englishMake, ...(MAKE_ALIASES[englishMake] || [])];
  const allModelNames = getAllModelNames(englishMake, model);
  
  return {
    originalMake: make,
    originalModel: model,
    englishMake,
    englishModel,
    allMakeNames: [...new Set(allMakeNames)],
    allModelNames: [...new Set(allModelNames)],
    searchKey: createCarKey(make, model),
  };
}
