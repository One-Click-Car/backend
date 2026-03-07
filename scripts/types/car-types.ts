/**
 * Car Database Types
 * טיפוסים למסד נתוני המכוניות המורחב
 */

// ==================== FEATURES - אבזור ====================

export interface ComfortFeatures {
  electricWindows: 'all' | 'front' | 'none';
  autoWindowClose: boolean;
  foldingMirrors: 'electric' | 'manual' | 'none';
  heatedMirrors: boolean;
  heatedSeats: 'all' | 'front' | 'none';
  ventilatedSeats: 'all' | 'front' | 'none';
  electricSeats: 'driver+passenger' | 'driver' | 'none';
  memorySeats: boolean;
  leatherSeats: boolean;
  sunroof: 'panoramic' | 'regular' | 'none';
  climateControl: '4-zone' | '3-zone' | '2-zone' | 'manual';
  heatedSteeringWheel: boolean;
  electricTailgate: boolean;
  keylessEntry: boolean;
  pushButtonStart: boolean;
  remoteStart: boolean;
  ambientLighting: boolean;
}

export interface SafetyFeatures {
  airbags: number;
  abs: boolean;
  esp: boolean;
  tractionControl: boolean;
  blindSpotMonitor: boolean;
  laneDepartureWarning: boolean;
  laneKeepAssist: boolean;
  forwardCollisionWarning: boolean;
  automaticEmergencyBraking: boolean;
  adaptiveCruiseControl: boolean;
  rearCrossTrafficAlert: boolean;
  parkingSensors: 'front+rear' | 'rear' | 'none';
  camera360: boolean;
  reverseCamera: boolean;
  nightVision: boolean;
  headUpDisplay: boolean;
  tirePressureMonitor: boolean;
  isofixPoints: number;
}

export interface InfotainmentFeatures {
  screenSize: number; // inches
  digitalCluster: boolean;
  appleCarPlay: boolean;
  androidAuto: boolean;
  wirelessCarPlay: boolean;
  wirelessAndroidAuto: boolean;
  wirelessCharging: boolean;
  usbPorts: number;
  usbCPorts: number;
  bluetooth: boolean;
  navigation: boolean;
  soundSystem: string; // e.g., "Harman Kardon", "Bose", "Standard"
  speakers: number;
  voiceControl: boolean;
  overTheAirUpdates: boolean;
}

export interface DrivingFeatures {
  driveMode: string[]; // e.g., ["Comfort", "Sport", "Eco"]
  paddleShifters: boolean;
  adaptiveSuspension: boolean;
  allWheelDrive: boolean;
  electronicDifferential: boolean;
  hillStartAssist: boolean;
  hillDescentControl: boolean;
  autoPark: boolean;
  trailerAssist: boolean;
}

export interface LightingFeatures {
  headlights: 'LED Matrix' | 'LED' | 'Xenon' | 'Halogen';
  autoHighBeam: boolean;
  fogLights: boolean;
  daytimeRunningLights: boolean;
  ambientInteriorLighting: boolean;
  welcomeLights: boolean;
}

export interface VersionFeatures {
  comfort: ComfortFeatures;
  safety: SafetyFeatures;
  infotainment: InfotainmentFeatures;
  driving: DrivingFeatures;
  lighting: LightingFeatures;
}

// ==================== VERSION - גרסה ====================

export interface CarVersion {
  // שדות קיימים (לא לשנות!)
  enginVolume: string;
  horsePower: number;
  name: string;
  
  // שדות חדשים
  trimLevel?: string;
  transmission?: 'automatic' | 'manual' | 'cvt' | 'dct';
  fuelType?: 'petrol' | 'diesel' | 'hybrid' | 'plugin-hybrid' | 'electric';
  features?: Partial<VersionFeatures>;
}

// ==================== SAFETY RATING - דירוג בטיחות ====================

/**
 * תיאור מערכת בטיחות עם ערך ותיאור
 */
export interface SafetyFeatureInfo {
  available: boolean;      // האם המערכת קיימת
  nameEn: string;          // שם באנגלית
  nameHe: string;          // שם בעברית  
  description?: string;    // תיאור מפורט
}

/**
 * מערכות בטיחות פעילות מ-Euro NCAP
 * כל שדה: true = קיים, false = לא קיים, undefined = לא נבדק
 */
export interface EuroNCAPSafetyFeatures {
  // Active Safety Systems - מערכות בטיחות פעילות
  activeBonnet?: boolean;                    // מכסה מנוע פעיל (מגן על הולכי רגל)
  aebVulnerableRoadUsers?: boolean;          // בלימת חירום אוטומטית להולכי רגל/רוכבים
  aebPedestrianReverse?: boolean;            // בלימת חירום בנסיעה אחורה להולכי רגל
  cyclistDooringPrevention?: boolean;        // מניעת פתיחת דלת לרוכבי אופניים
  aebMotorcyclist?: boolean;                 // בלימת חירום לרוכבי אופנוע
  aebCarToCar?: boolean;                     // בלימת חירום רכב-לרכב
  speedAssistance?: boolean;                 // סיוע מהירות (זיהוי תמרורים והגבלת מהירות)
  laneAssistSystem?: boolean;                // מערכת שמירת נתיב
  fatigueDistractDetection?: boolean;        // זיהוי עייפות והסחת דעת
  
  // Additional Safety Systems - מערכות נוספות
  rearSeatbeltReminder?: boolean;            // תזכורת חגורות מושב אחורי
  driverMonitoring?: boolean;                // ניטור נהג (עיניים על הכביש)
  emergencyStopAssist?: boolean;             // עצירת חירום אוטומטית
  rescueSheetLocation?: boolean;             // גיליון חילוץ (מידע לכבאים)
  eCall?: boolean;                           // שיחת חירום אוטומטית
  
  // Collision avoidance - מניעת התנגשות
  junctionAssist?: boolean;                  // סיוע בצומת
  turnAcrossPathAEB?: boolean;               // בלימה בפניה
  oncomingAEB?: boolean;                     // בלימה כנגד רכב מולי
}

/**
 * מילון תיאורים לכל מערכות הבטיחות
 */
export const SAFETY_FEATURES_INFO: Record<keyof EuroNCAPSafetyFeatures, { nameEn: string; nameHe: string; description: string }> = {
  activeBonnet: {
    nameEn: 'Active Bonnet',
    nameHe: 'מכסה מנוע פעיל',
    description: 'מכסה מנוע שמתרומם אוטומטית בעת פגיעה בהולך רגל כדי להרחיק אותו ממנוע הרכב ולהפחית פציעות'
  },
  aebVulnerableRoadUsers: {
    nameEn: 'AEB Vulnerable Road Users',
    nameHe: 'בלימת חירום להולכי רגל',
    description: 'בלימת חירום אוטומטית המזהה הולכי רגל ורוכבי אופניים ועוצרת את הרכב למניעת פגיעה'
  },
  aebPedestrianReverse: {
    nameEn: 'AEB Pedestrian - Reverse',
    nameHe: 'בלימת חירום אחורית להולכי רגל',
    description: 'בלימת חירום אוטומטית בנסיעה לאחור כשמזוהה הולך רגל או מכשול מאחור'
  },
  cyclistDooringPrevention: {
    nameEn: 'Cyclist Dooring Prevention',
    nameHe: 'מניעת פתיחת דלת לרוכבים',
    description: 'מערכת שמתריעה או מונעת פתיחת דלת כשרוכב אופניים מתקרב מאחור'
  },
  aebMotorcyclist: {
    nameEn: 'AEB Motorcyclist',
    nameHe: 'בלימת חירום לאופנועים',
    description: 'בלימת חירום אוטומטית המזהה רוכבי אופנועים ועוצרת את הרכב למניעת פגיעה'
  },
  aebCarToCar: {
    nameEn: 'AEB Car-to-Car',
    nameHe: 'בלימת חירום רכב-לרכב',
    description: 'בלימת חירום אוטומטית למניעת התנגשות ברכב שלפניך, פועלת בכל המהירויות'
  },
  speedAssistance: {
    nameEn: 'Speed Assistance',
    nameHe: 'סיוע מהירות',
    description: 'זיהוי תמרורי מהירות והתראה או הגבלה אוטומטית של מהירות הרכב בהתאם'
  },
  laneAssistSystem: {
    nameEn: 'Lane Assist System',
    nameHe: 'מערכת שמירת נתיב',
    description: 'מערכת שמזהה סטייה מהנתיב ומתריעה או מתקנת את כיוון הנסיעה אוטומטית'
  },
  fatigueDistractDetection: {
    nameEn: 'Fatigue / Distraction Detection',
    nameHe: 'זיהוי עייפות והסחת דעת',
    description: 'מערכת שמנטרת את הנהג ומתריעה כשמזוהים סימני עייפות או הסחת דעת'
  },
  rearSeatbeltReminder: {
    nameEn: 'Rear Seatbelt Reminder',
    nameHe: 'תזכורת חגורות אחוריות',
    description: 'התראה כשנוסעים במושבים האחוריים לא חגורים'
  },
  driverMonitoring: {
    nameEn: 'Driver Monitoring',
    nameHe: 'ניטור נהג',
    description: 'מצלמה שמנטרת את עיני הנהג ומוודאת שהוא מסתכל על הכביש'
  },
  emergencyStopAssist: {
    nameEn: 'Emergency Stop Assist',
    nameHe: 'עצירת חירום אוטומטית',
    description: 'עצירה אוטומטית של הרכב כשמזוהה שהנהג אינו מגיב (התקף לב, התעלפות)'
  },
  rescueSheetLocation: {
    nameEn: 'Rescue Sheet Location',
    nameHe: 'גיליון חילוץ',
    description: 'מידע לכוחות ההצלה על מיקום חיתוך בטוח של הרכב'
  },
  eCall: {
    nameEn: 'eCall',
    nameHe: 'שיחת חירום אוטומטית',
    description: 'חיוג אוטומטי לשירותי חירום בעת תאונה עם שליחת מיקום GPS'
  },
  junctionAssist: {
    nameEn: 'Junction Assist',
    nameHe: 'סיוע בצומת',
    description: 'התראה או בלימה אוטומטית למניעת התנגשות בצומת עם רכב חוצה'
  },
  turnAcrossPathAEB: {
    nameEn: 'Turn Across Path AEB',
    nameHe: 'בלימה בפניה',
    description: 'בלימת חירום בעת פניה שמאלה כשרכב מגיע מהכיוון הנגדי'
  },
  oncomingAEB: {
    nameEn: 'Oncoming AEB',
    nameHe: 'בלימה מול רכב מולי',
    description: 'בלימת חירום כשמזוהה רכב בנתיב הנגדי בדרך להתנגשות חזיתית'
  }
};

export interface SafetyRating {
  // Euro NCAP ratings - דירוגים כלליים (אחוזים)
  euroNcapStars?: number; // 0-5 כוכבים
  euroNcapYear?: number;  // שנת הבדיקה
  euroNcapUrl?: string;   // קישור לתוצאות
  adultOccupant?: number; // % הגנה על מבוגרים
  childOccupant?: number; // % הגנה על ילדים
  pedestrian?: number;    // % הגנה על הולכי רגל (Vulnerable Road Users)
  safetyAssist?: number;  // % מערכות בטיחות
  
  // Euro NCAP Safety Features - מערכות בטיחות מפורטות
  safetyFeatures?: EuroNCAPSafetyFeatures;
  
  // NHTSA (US) ratings - דירוגים אמריקאיים (1-5 כוכבים)
  nhtsaOverall?: number;       // דירוג כללי
  nhtsaFrontalCrash?: number;  // התנגשות חזיתית
  nhtsaSideCrash?: number;     // התנגשות צדדית
  nhtsaRollover?: number;      // התהפכות
}

// ==================== SPECS - מפרט טכני ====================

export interface CarSpecs {
  // מידות (מ"מ)
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  
  // משקל (ק"ג)
  curbWeight?: number;
  grossWeight?: number;
  
  // נפחים (ליטר)
  trunkVolume?: number;
  trunkVolumeMax?: number; // עם מושבים מקופלים
  fuelTankCapacity?: number;
  
  // מקומות ודלתות
  seats?: number;
  doors?: number;
  
  // חשמלי
  batteryCapacity?: number; // kWh
  electricRange?: number; // km
  chargingTimeAC?: number; // hours
  chargingTimeDC?: number; // minutes to 80%
}

// ==================== IMAGES - תמונות ====================

export interface CarImages {
  main?: string;
  gallery?: string[];
  interior?: string[];
  colors?: { [colorName: string]: string }; // color name -> image URL
}

// ==================== MODEL - דגם ====================

export interface CarModel {
  // שדות קיימים (לא לשנות!)
  properties: {
    'גירסה מומלצת: '?: string;
    'צריכת דלק'?: string;
    'טווח נסיעה חשמלי'?: string;
    'קטגוריה'?: string;
    'שנת השקה'?: string;
    [key: string]: string | undefined;
  };
  versions: CarVersion[];
  years: number[];
  
  // שדות חדשים
  safety?: SafetyRating;
  specs?: CarSpecs;
  images?: CarImages;
}

// ==================== MAKE - יצרן ====================

export interface CarMake {
  [modelName: string]: CarModel;
}

// ==================== DATABASE - מסד נתונים ====================

export interface CarDatabase {
  [makeName: string]: CarMake;
}

// ==================== DEFAULTS - ברירות מחדל ====================

export const DEFAULT_COMFORT_FEATURES: ComfortFeatures = {
  electricWindows: 'front',
  autoWindowClose: false,
  foldingMirrors: 'manual',
  heatedMirrors: false,
  heatedSeats: 'none',
  ventilatedSeats: 'none',
  electricSeats: 'none',
  memorySeats: false,
  leatherSeats: false,
  sunroof: 'none',
  climateControl: 'manual',
  heatedSteeringWheel: false,
  electricTailgate: false,
  keylessEntry: false,
  pushButtonStart: false,
  remoteStart: false,
  ambientLighting: false,
};

export const DEFAULT_SAFETY_FEATURES: SafetyFeatures = {
  airbags: 2,
  abs: true,
  esp: true,
  tractionControl: true,
  blindSpotMonitor: false,
  laneDepartureWarning: false,
  laneKeepAssist: false,
  forwardCollisionWarning: false,
  automaticEmergencyBraking: false,
  adaptiveCruiseControl: false,
  rearCrossTrafficAlert: false,
  parkingSensors: 'none',
  camera360: false,
  reverseCamera: false,
  nightVision: false,
  headUpDisplay: false,
  tirePressureMonitor: false,
  isofixPoints: 0,
};

export const DEFAULT_INFOTAINMENT_FEATURES: InfotainmentFeatures = {
  screenSize: 7,
  digitalCluster: false,
  appleCarPlay: false,
  androidAuto: false,
  wirelessCarPlay: false,
  wirelessAndroidAuto: false,
  wirelessCharging: false,
  usbPorts: 1,
  usbCPorts: 0,
  bluetooth: true,
  navigation: false,
  soundSystem: 'Standard',
  speakers: 4,
  voiceControl: false,
  overTheAirUpdates: false,
};

export const DEFAULT_DRIVING_FEATURES: DrivingFeatures = {
  driveMode: ['Normal'],
  paddleShifters: false,
  adaptiveSuspension: false,
  allWheelDrive: false,
  electronicDifferential: false,
  hillStartAssist: false,
  hillDescentControl: false,
  autoPark: false,
  trailerAssist: false,
};

export const DEFAULT_LIGHTING_FEATURES: LightingFeatures = {
  headlights: 'Halogen',
  autoHighBeam: false,
  fogLights: false,
  daytimeRunningLights: true,
  ambientInteriorLighting: false,
  welcomeLights: false,
};

export const DEFAULT_VERSION_FEATURES: VersionFeatures = {
  comfort: DEFAULT_COMFORT_FEATURES,
  safety: DEFAULT_SAFETY_FEATURES,
  infotainment: DEFAULT_INFOTAINMENT_FEATURES,
  driving: DEFAULT_DRIVING_FEATURES,
  lighting: DEFAULT_LIGHTING_FEATURES,
};
