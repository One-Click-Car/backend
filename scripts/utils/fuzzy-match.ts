/**
 * Fuzzy Matching Utilities
 * כלים להתאמה בין שמות דגמים שונים
 */

/**
 * נרמול שם - הסרת תווים מיוחדים והמרה לקטנות
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_\.]/g, ' ')
    .replace(/[^\w\s\u0590-\u05FF]/g, '') // Keep Hebrew and English letters
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * חישוב מרחק Levenshtein בין שני מחרוזות
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * חישוב דמיון (0-1) בין שני מחרוזות
 */
export function similarity(str1: string, str2: string): number {
  const normalized1 = normalizeName(str1);
  const normalized2 = normalizeName(str2);
  
  if (normalized1 === normalized2) return 1;
  
  const maxLength = Math.max(normalized1.length, normalized2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(normalized1, normalized2);
  return 1 - distance / maxLength;
}

/**
 * בדיקה אם מחרוזת אחת מכילה את השנייה
 */
export function containsMatch(haystack: string, needle: string): boolean {
  return normalizeName(haystack).includes(normalizeName(needle));
}

/**
 * מציאת ההתאמה הטובה ביותר מתוך רשימה
 */
export function findBestMatch(
  target: string,
  candidates: string[],
  minSimilarity = 0.6
): { match: string | null; score: number; index: number } {
  let bestMatch: string | null = null;
  let bestScore = 0;
  let bestIndex = -1;
  
  const normalizedTarget = normalizeName(target);
  
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const normalizedCandidate = normalizeName(candidate);
    
    // בדיקת התאמה מדויקת
    if (normalizedTarget === normalizedCandidate) {
      return { match: candidate, score: 1, index: i };
    }
    
    // בדיקת הכלה
    if (containsMatch(candidate, target) || containsMatch(target, candidate)) {
      const score = 0.9;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
        bestIndex = i;
      }
      continue;
    }
    
    // חישוב דמיון
    const score = similarity(target, candidate);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
      bestIndex = i;
    }
  }
  
  if (bestScore >= minSimilarity) {
    return { match: bestMatch, score: bestScore, index: bestIndex };
  }
  
  return { match: null, score: bestScore, index: -1 };
}

/**
 * מיפוי שמות יצרנים נפוצים (אנגלית <-> עברית)
 */
export const MAKE_ALIASES: Record<string, string[]> = {
  // German
  'BMW': ['ב.מ.וו', 'במוו', 'בי אמ דאבליו'],
  'Mercedes-Benz': ['מרצדס', 'מרצדס-בנץ', 'Mercedes', 'מרצדס בנץ'],
  'Volkswagen': ['פולקסווגן', 'פולקסוואגן', 'VW'],
  'Audi': ['אאודי', 'אודי'],
  'Porsche': ['פורשה'],
  'Opel': ['אופל'],
  'Smart': ['סמארט'],
  
  // Japanese
  'Toyota': ['טויוטה'],
  'Honda': ['הונדה'],
  'Mazda': ['מאזדה', 'מזדה'],
  'Nissan': ['ניסאן'],
  'Mitsubishi': ['מיצובישי'],
  'Subaru': ['סובארו'],
  'Suzuki': ['סוזוקי'],
  'Lexus': ['לקסוס'],
  'Infiniti': ['אינפיניטי'],
  'Acura': ['אקורה'],
  'Daihatsu': ['דייהטסו'],
  'Isuzu': ['איסוזו'],
  
  // Korean
  'Hyundai': ['יונדאי', 'יונדה', 'הונדאי'],
  'Kia': ['קיה', 'קאיה'],
  'Genesis': ['ג\'נסיס', 'גנסיס'],
  'SsangYong': ['סאנגיונג', 'סנגיונג'],
  
  // American
  'Ford': ['פורד'],
  'Chevrolet': ['שברולט', 'שבי'],
  'Jeep': ['ג\'יפ', 'גיפ'],
  'Cadillac': ['קדילאק'],
  'GMC': ['ג\'י.אמ.סי', 'ג.מ.ס'],
  'Lincoln': ['לינקולן'],
  'Dodge': ['דודג\'', 'דודג'],
  'Chrysler': ['קרייזלר'],
  'Ram': ['ראם', 'רם'],
  'Buick': ['ביואיק'],
  'Tesla': ['טסלה'],
  
  // French
  'Peugeot': ['פיג\'ו', 'פיגו', 'פז\'ו'],
  'Renault': ['רנו'],
  'Citroen': ['סיטרואן', 'סיטרון'],
  'DS': ['די.אס', 'דיאס'],
  
  // Italian
  'Fiat': ['פיאט'],
  'Alfa Romeo': ['אלפא רומיאו', 'אלפא'],
  'Maserati': ['מזראטי'],
  'Ferrari': ['פרארי'],
  'Lamborghini': ['למבורגיני'],
  
  // British
  'Land Rover': ['לנד רובר'],
  'Jaguar': ['יגואר'],
  'Mini': ['מיני'],
  'Bentley': ['בנטלי'],
  'Rolls-Royce': ['רולס רויס', 'רולסרויס'],
  'Aston Martin': ['אסטון מרטין'],
  'McLaren': ['מקלארן'],
  'Lotus': ['לוטוס'],
  
  // Swedish
  'Volvo': ['וולוו'],
  
  // Czech
  'Skoda': ['סקודה'],
  
  // Spanish
  'Seat': ['סיאט'],
  'Cupra': ['קופרה'],
  
  // Chinese
  'BYD': ['ביד', 'BYD', 'ביי.וואי.די'],
  'MG': ['אמ.ג\'י', 'אמג', 'אם.ג\'י'],
  'Geely': ['ג\'ילי', 'גילי'],
  'Chery': ['צ\'רי', 'צרי', 'שרי'],
  'NIO': ['ניו', 'NIO'],
  'XPENG': ['אקספנג', 'XPENG', 'שיאופנג'],
  'Great Wall': ['גרייט וול', 'גרייטוול'],
  'Haval': ['האוואל', 'חוואל'],
  'Lynk & Co': ['לינק אנד קו', 'לינק'],
  'AIWAYS': ['איוויס', 'AIWAYS'],
  'JAC': ['ג\'אקו', 'גאקו', 'JAC'],
  'Ora': ['אורה', 'ORA'],
  'Hongqi': ['הונגצ\'י'],
  'Zeekr': ['זיקר'],
  'Li Auto': ['לי אוטו'],
  'Leapmotor': ['ליפמוטור'],
  
  // Indian
  'Mahindra': ['מהינדרה'],
  'Tata': ['טאטא'],
  
  // Romanian
  'Dacia': ['דאצ\'יה', 'דאציה'],
  
  // More brands
  'Abarth': ['אברת\'', 'אברת'],
  'WEY': ['ווי', 'WEY'],
  'Lancia': ['לנצ\'יה', 'לנציה'],
  'Polestar': ['פולסטאר'],
  'Lucid': ['לוסיד'],
  'Rivian': ['ריביאן'],
  'Cupra': ['קופרה'],
  'Alpine': ['אלפין'],
  'Fisker': ['פיסקר'],
  'VinFast': ['וינפאסט'],
  'Tank': ['טאנק'],
  'ORA': ['אורה', 'ORA'],
  'Wuling': ['וולינג'],
  'GAC': ['ג\'אק', 'GAC'],
  'SAIC': ['סאיק'],
  'Maxus': ['מקסוס'],
  'LDV': ['אל.די.וי', 'LDV'],
  'SWM': ['אס.דאבליו.אם'],
  'DFSK': ['די.אף.אס.קיי'],
  'Skywell': ['סקייוול'],
  'Seres': ['סרס'],
  'Voyah': ['וויאה'],
};

/**
 * נרמול שם יצרן
 */
export function normalizeMakeName(make: string): string {
  const normalized = normalizeName(make);
  
  for (const [canonical, aliases] of Object.entries(MAKE_ALIASES)) {
    if (normalizeName(canonical) === normalized) {
      return canonical;
    }
    for (const alias of aliases) {
      if (normalizeName(alias) === normalized) {
        return canonical;
      }
    }
  }
  
  return make;
}

/**
 * מציאת התאמה בין שם דגם מהמקור לשם דגם ב-Firebase
 */
export function matchModelName(
  sourceMake: string,
  sourceModel: string,
  firebaseModels: string[]
): { match: string | null; score: number } {
  // ניסיון התאמה ישירה
  const directMatch = findBestMatch(sourceModel, firebaseModels, 0.7);
  if (directMatch.match) {
    return { match: directMatch.match, score: directMatch.score };
  }
  
  // ניסיון עם הסרת שם היצרן מהדגם
  const modelWithoutMake = sourceModel
    .replace(new RegExp(sourceMake, 'gi'), '')
    .trim();
  
  if (modelWithoutMake !== sourceModel) {
    const withoutMakeMatch = findBestMatch(modelWithoutMake, firebaseModels, 0.7);
    if (withoutMakeMatch.match) {
      return { match: withoutMakeMatch.match, score: withoutMakeMatch.score };
    }
  }
  
  return { match: null, score: 0 };
}
