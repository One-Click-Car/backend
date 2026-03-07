/**
 * Common Terms Hebrew to English Mapping
 * מיפוי מילים נפוצות מעברית לאנגלית
 */

// סוגי תיבות הילוכים
export const TRANSMISSION_TERMS: Record<string, string> = {
  "אוט'": 'Automatic',
  'אוטומטי': 'Automatic',
  'אוטומטית': 'Automatic',
  'אוטו': 'Automatic',
  'ידני': 'Manual',
  'ידנית': 'Manual',
  'רובוטית': 'Automated Manual',
  'CVT': 'CVT',
  'דאבל קלאץ': 'DCT',
  'DCT': 'DCT',
};

// סוגי דלק/הנעה
export const FUEL_TYPE_TERMS: Record<string, string> = {
  'חשמלי': 'Electric',
  'חשמלית': 'Electric',
  'בנזין': 'Gasoline',
  'דיזל': 'Diesel',
  'היברידי': 'Hybrid',
  'היבריד': 'Hybrid',
  'היברידית': 'Hybrid',
  'פלאג אין היברידי': 'Plug-in Hybrid',
  'PHEV': 'Plug-in Hybrid',
  'גז': 'LPG',
  'מימן': 'Hydrogen',
};

// סוגי מרכב
export const BODY_TYPE_TERMS: Record<string, string> = {
  'סדאן': 'Sedan',
  'קופה': 'Coupe',
  'קופא': 'Coupe',
  'האצ\'בק': 'Hatchback',
  'הצבק': 'Hatchback',
  'האצבק': 'Hatchback',
  'סטיישן': 'Station Wagon',
  'סטיישן ואגון': 'Station Wagon',
  'טורינג': 'Touring',
  'קבריולה': 'Convertible',
  'קבריולט': 'Convertible',
  'רודסטר': 'Roadster',
  'מיניוואן': 'Minivan',
  'מיני ואן': 'Minivan',
  'ואן': 'Van',
  'פנאי/שטח': 'SUV',
  'פנאי שטח': 'SUV',
  'שטח': 'SUV',
  'קרוסאובר': 'Crossover',
  'פיקאפ': 'Pickup',
  'ליפטבק': 'Liftback',
  'גראן טורר': 'Gran Tourer',
  'גראן קופה': 'Gran Coupe',
  'אקטיב טורר': 'Active Tourer',
  'ספורטבק': 'Sportback',
};

// קטגוריות רכב
export const CATEGORY_TERMS: Record<string, string> = {
  'מיני': 'Mini',
  'קטנה': 'Subcompact',
  'קומפקטית': 'Compact',
  'משפחתית': 'Midsize',
  'גדולה': 'Full-size',
  'יוקרתית': 'Luxury',
  'ספורט': 'Sport',
  'פנאי/שטח קטן': 'Subcompact SUV',
  'פנאי/שטח בינוני': 'Compact SUV',
  'פנאי/שטח גדול': 'Midsize SUV',
  'פנאי/שטח יוקרתי': 'Luxury SUV',
};

// מונחים טכניים
export const TECHNICAL_TERMS: Record<string, string> = {
  'טורבו': 'Turbo',
  'סופרצ\'רג\'ר': 'Supercharger',
  'ל\'': 'L',
  'ליטר': 'L',
  'סמ"ק': 'cc',
  'כ"ס': 'HP',
  'כוח סוס': 'HP',
  'קוו': 'kW',
  'ניוטון מטר': 'Nm',
  'ק"מ': 'km',
  'קילומטר': 'km',
  'שעה': 'h',
};

// הנעה
export const DRIVE_TYPE_TERMS: Record<string, string> = {
  '4x4': 'AWD',
  'הנעה כפולה': 'AWD',
  'הנעה קדמית': 'FWD',
  'הנעה אחורית': 'RWD',
  'קדמי': 'FWD',
  'אחורי': 'RWD',
  'כפול': 'AWD',
  'xDrive': 'AWD',
  'quattro': 'AWD',
  '4MATIC': 'AWD',
  'e-quattro': 'AWD',
  'Symmetrical AWD': 'AWD',
};

// רמות גימור נפוצות (באנגלית כבר, לצורך זיהוי)
export const TRIM_LEVELS_COMMON: string[] = [
  'Base',
  'Comfort',
  'Style',
  'Luxury',
  'Premium',
  'Sport',
  'S-Line',
  'M Sport',
  'AMG Line',
  'R-Line',
  'GT Line',
  'Executive',
  'Elite',
  'Xcite',
  'Prime',
  'Competition',
  'Performance',
  'Carbon',
  'Exclusive',
  'First Edition',
  'Launch Edition',
];

// מילות קישור ושאריות להסרה
export const FILLER_WORDS: string[] = [
  'ל\'',
  'עם',
  'כולל',
  'ללא',
  'מנוע',
  'דגם',
  'גרסה',
  'רכב',
];

/**
 * מחזיר את כל מפות התרגום כאובייקט אחד
 */
export function getAllTermMappings(): Record<string, string> {
  return {
    ...TRANSMISSION_TERMS,
    ...FUEL_TYPE_TERMS,
    ...BODY_TYPE_TERMS,
    ...CATEGORY_TERMS,
    ...TECHNICAL_TERMS,
    ...DRIVE_TYPE_TERMS,
  };
}

/**
 * מתרגם מונח בודד מעברית לאנגלית
 */
export function translateTerm(hebrewTerm: string): string | null {
  const allMappings = getAllTermMappings();
  const normalized = hebrewTerm.trim();
  
  // בדיקה ישירה
  if (allMappings[normalized]) {
    return allMappings[normalized];
  }
  
  // בדיקה case-insensitive
  for (const [hebrew, english] of Object.entries(allMappings)) {
    if (hebrew.toLowerCase() === normalized.toLowerCase()) {
      return english;
    }
  }
  
  return null;
}

/**
 * מתרגם מחרוזת שמכילה מונחים עבריים
 * מחליף כל מונח שנמצא במיפוי
 */
export function translateTermsInString(text: string): string {
  let result = text;
  const allMappings = getAllTermMappings();
  
  // מיון לפי אורך (ארוך קודם) כדי למנוע החלפות חלקיות
  const sortedTerms = Object.keys(allMappings).sort((a, b) => b.length - a.length);
  
  for (const hebrewTerm of sortedTerms) {
    const englishTerm = allMappings[hebrewTerm];
    const regex = new RegExp(hebrewTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, englishTerm);
  }
  
  return result;
}

/**
 * מזהה סוג תיבת הילוכים מתוך מחרוזת
 */
export function detectTransmission(text: string): string | null {
  const normalized = text.toLowerCase();
  
  for (const [hebrew, english] of Object.entries(TRANSMISSION_TERMS)) {
    if (normalized.includes(hebrew.toLowerCase())) {
      return english;
    }
  }
  
  return null;
}

/**
 * מזהה סוג דלק מתוך מחרוזת
 */
export function detectFuelType(text: string): string | null {
  const normalized = text.toLowerCase();
  
  for (const [hebrew, english] of Object.entries(FUEL_TYPE_TERMS)) {
    if (normalized.includes(hebrew.toLowerCase())) {
      return english;
    }
  }
  
  return null;
}

/**
 * מזהה סוג מרכב מתוך מחרוזת
 */
export function detectBodyType(text: string): string | null {
  const normalized = text.toLowerCase();
  
  for (const [hebrew, english] of Object.entries(BODY_TYPE_TERMS)) {
    if (normalized.includes(hebrew.toLowerCase())) {
      return english;
    }
  }
  
  return null;
}

/**
 * מזהה סוג הנעה מתוך מחרוזת
 */
export function detectDriveType(text: string): string | null {
  for (const [term, english] of Object.entries(DRIVE_TYPE_TERMS)) {
    if (text.includes(term)) {
      return english;
    }
  }
  
  return null;
}
