/**
 * Car Database Types
 * טיפוסים למסד נתוני המכוניות
 * 
 * קובץ זה מכיל את כל הטיפוסים לשימוש באפליקציה
 */

// ==================== FEATURES - אבזור ====================

export interface ComfortFeatures {
  /** חלונות חשמליים - all/front/none */
  electricWindows: 'all' | 'front' | 'none';
  /** סגירת חלונות אוטומטית */
  autoWindowClose: boolean;
  /** קיפול מראות - electric/manual/none */
  foldingMirrors: 'electric' | 'manual' | 'none';
  /** מראות מחוממות */
  heatedMirrors: boolean;
  /** מושבים מחוממים */
  heatedSeats: 'all' | 'front' | 'none';
  /** מושבים מאווררים */
  ventilatedSeats: 'all' | 'front' | 'none';
  /** מושבים חשמליים */
  electricSeats: 'driver+passenger' | 'driver' | 'none';
  /** זיכרון מושבים */
  memorySeats: boolean;
  /** ריפוד עור */
  leatherSeats: boolean;
  /** גג שמש */
  sunroof: 'panoramic' | 'regular' | 'none';
  /** בקרת אקלים */
  climateControl: '4-zone' | '3-zone' | '2-zone' | 'manual';
  /** הגה מחומם */
  heatedSteeringWheel: boolean;
  /** דלת תא מטען חשמלית */
  electricTailgate: boolean;
  /** כניסה ללא מפתח */
  keylessEntry: boolean;
  /** התנעה בכפתור */
  pushButtonStart: boolean;
  /** התנעה מרחוק */
  remoteStart: boolean;
  /** תאורת אווירה */
  ambientLighting: boolean;
}

export interface SafetyFeatures {
  /** מספר כריות אוויר */
  airbags: number;
  /** ABS */
  abs: boolean;
  /** ESP - בקרת יציבות */
  esp: boolean;
  /** בקרת משיכה */
  tractionControl: boolean;
  /** ניטור שטח מת */
  blindSpotMonitor: boolean;
  /** התראת סטייה מנתיב */
  laneDepartureWarning: boolean;
  /** שמירה על נתיב */
  laneKeepAssist: boolean;
  /** התראת התנגשות קדמית */
  forwardCollisionWarning: boolean;
  /** בלימת חירום אוטומטית */
  automaticEmergencyBraking: boolean;
  /** שיוט אדפטיבי */
  adaptiveCruiseControl: boolean;
  /** התראת תנועה מאחור */
  rearCrossTrafficAlert: boolean;
  /** חיישני חניה */
  parkingSensors: 'front+rear' | 'rear' | 'none';
  /** מצלמה 360 */
  camera360: boolean;
  /** מצלמת רוורס */
  reverseCamera: boolean;
  /** ראיית לילה */
  nightVision: boolean;
  /** תצוגה עילית */
  headUpDisplay: boolean;
  /** ניטור לחץ צמיגים */
  tirePressureMonitor: boolean;
  /** נקודות ISOFIX */
  isofixPoints: number;
}

export interface InfotainmentFeatures {
  /** גודל מסך באינצ'ים */
  screenSize: number;
  /** לוח מחוונים דיגיטלי */
  digitalCluster: boolean;
  /** Apple CarPlay */
  appleCarPlay: boolean;
  /** Android Auto */
  androidAuto: boolean;
  /** Apple CarPlay אלחוטי */
  wirelessCarPlay: boolean;
  /** Android Auto אלחוטי */
  wirelessAndroidAuto: boolean;
  /** טעינה אלחוטית */
  wirelessCharging: boolean;
  /** מספר חיבורי USB */
  usbPorts: number;
  /** מספר חיבורי USB-C */
  usbCPorts: number;
  /** Bluetooth */
  bluetooth: boolean;
  /** ניווט */
  navigation: boolean;
  /** מערכת שמע */
  soundSystem: string;
  /** מספר רמקולים */
  speakers: number;
  /** שליטה קולית */
  voiceControl: boolean;
  /** עדכונים OTA */
  overTheAirUpdates: boolean;
}

export interface DrivingFeatures {
  /** מצבי נהיגה */
  driveMode: string[];
  /** הילוכים בהגה */
  paddleShifters: boolean;
  /** מתלים אדפטיביים */
  adaptiveSuspension: boolean;
  /** הנעה כפולה */
  allWheelDrive: boolean;
  /** דיפרנציאל אלקטרוני */
  electronicDifferential: boolean;
  /** סיוע בעליה */
  hillStartAssist: boolean;
  /** בקרת ירידה */
  hillDescentControl: boolean;
  /** חניה אוטומטית */
  autoPark: boolean;
  /** סיוע לגרירה */
  trailerAssist: boolean;
}

export interface LightingFeatures {
  /** סוג פנסים */
  headlights: 'LED Matrix' | 'LED' | 'Xenon' | 'Halogen';
  /** אור גבוה אוטומטי */
  autoHighBeam: boolean;
  /** פנסי ערפל */
  fogLights: boolean;
  /** פנסי יום */
  daytimeRunningLights: boolean;
  /** תאורת אווירה פנימית */
  ambientInteriorLighting: boolean;
  /** תאורת קבלת פנים */
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
  /** נפח מנוע (סמ"ק או טווח ק"מ לחשמלי) */
  enginVolume: string;
  /** כוחות סוס */
  horsePower: number;
  /** שם מלא של הגרסה */
  name: string;
  /** רמת גימור */
  trimLevel?: string;
  /** תיבת הילוכים */
  transmission?: 'automatic' | 'manual' | 'cvt' | 'dct';
  /** סוג דלק */
  fuelType?: 'petrol' | 'diesel' | 'hybrid' | 'plugin-hybrid' | 'electric';
  /** אבזור */
  features?: Partial<VersionFeatures>;
}

// ==================== SAFETY RATING - דירוג בטיחות ====================

export interface SafetyRating {
  /** כוכבי Euro NCAP (0-5) */
  euroNcapStars?: number;
  /** שנת הבדיקה */
  euroNcapYear?: number;
  /** קישור לדף התוצאות */
  euroNcapUrl?: string;
  /** ציון הגנה על מבוגרים (אחוז) */
  adultOccupant?: number;
  /** ציון הגנה על ילדים (אחוז) */
  childOccupant?: number;
  /** ציון הגנה על הולכי רגל (אחוז) */
  pedestrian?: number;
  /** ציון מערכות בטיחות (אחוז) */
  safetyAssist?: number;
  
  /** דירוג NHTSA כללי (1-5) */
  nhtsaOverall?: number;
  /** דירוג התנגשות חזיתית */
  nhtsaFrontalCrash?: number;
  /** דירוג התנגשות צידית */
  nhtsaSideCrash?: number;
  /** דירוג התהפכות */
  nhtsaRollover?: number;
}

// ==================== SPECS - מפרט טכני ====================

export interface CarSpecs {
  /** אורך (מ"מ) */
  length?: number;
  /** רוחב (מ"מ) */
  width?: number;
  /** גובה (מ"מ) */
  height?: number;
  /** בסיס גלגלים (מ"מ) */
  wheelbase?: number;
  
  /** משקל עצמי (ק"ג) */
  curbWeight?: number;
  /** משקל מותר כולל (ק"ג) */
  grossWeight?: number;
  
  /** נפח תא מטען (ליטר) */
  trunkVolume?: number;
  /** נפח תא מטען מקסימלי - עם מושבים מקופלים (ליטר) */
  trunkVolumeMax?: number;
  /** נפח מיכל דלק (ליטר) */
  fuelTankCapacity?: number;
  
  /** מספר מקומות */
  seats?: number;
  /** מספר דלתות */
  doors?: number;
  
  /** קיבולת סוללה (kWh) - לרכב חשמלי */
  batteryCapacity?: number;
  /** טווח נסיעה חשמלי (ק"מ) */
  electricRange?: number;
  /** זמן טעינה AC (שעות) */
  chargingTimeAC?: number;
  /** זמן טעינה DC עד 80% (דקות) */
  chargingTimeDC?: number;
}

// ==================== IMAGES - תמונות ====================

export interface CarImages {
  /** תמונה ראשית */
  main?: string;
  /** גלריה */
  gallery?: string[];
  /** תמונות פנים */
  interior?: string[];
  /** תמונות לפי צבע */
  colors?: { [colorName: string]: string };
}

// ==================== MODEL - דגם ====================

export interface CarModel {
  /** מאפיינים כלליים (מהמבנה הקיים) */
  properties: {
    'גירסה מומלצת: '?: string;
    'צריכת דלק'?: string;
    'טווח נסיעה חשמלי'?: string;
    'קטגוריה'?: string;
    'שנת השקה'?: string;
    [key: string]: string | undefined;
  };
  /** רשימת גרסאות */
  versions: CarVersion[];
  /** שנות ייצור */
  years: number[];
  
  /** דירוגי בטיחות */
  safety?: SafetyRating;
  /** מפרט טכני */
  specs?: CarSpecs;
  /** תמונות */
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

// ==================== SEARCH - חיפוש ====================

export interface CarSearchFilters {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  fuelType?: CarVersion['fuelType'];
  minHorsePower?: number;
  maxHorsePower?: number;
  
  // בטיחות
  minSafetyStars?: number;
  
  // אבזור
  hasFeature?: string[];
  
  // מפרט
  minSeats?: number;
  maxLength?: number;
  isElectric?: boolean;
  minRange?: number;
}

export interface CarSearchResult {
  make: string;
  model: string;
  modelData: CarModel;
  matchScore: number;
}
