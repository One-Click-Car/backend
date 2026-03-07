/**
 * Features Templates
 * תבניות אבזור לפי רמות גימור
 * 
 * הרעיון: לכל רמת גימור (בסיסי, בינוני, גבוה, יוקרה) יש תבנית אבזור טיפוסית
 * שאפשר להשתמש בה כנקודת התחלה
 */

import type { VersionFeatures, ComfortFeatures, SafetyFeatures, InfotainmentFeatures, DrivingFeatures, LightingFeatures } from '../types/car-types';

export type TrimLevel = 'basic' | 'mid' | 'high' | 'luxury' | 'sport';

/**
 * תבנית אבזור נוחות לפי רמת גימור
 */
export const COMFORT_BY_TRIM: Record<TrimLevel, ComfortFeatures> = {
  basic: {
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
  },
  mid: {
    electricWindows: 'all',
    autoWindowClose: true,
    foldingMirrors: 'electric',
    heatedMirrors: true,
    heatedSeats: 'front',
    ventilatedSeats: 'none',
    electricSeats: 'driver',
    memorySeats: false,
    leatherSeats: false,
    sunroof: 'none',
    climateControl: '2-zone',
    heatedSteeringWheel: false,
    electricTailgate: false,
    keylessEntry: true,
    pushButtonStart: true,
    remoteStart: false,
    ambientLighting: false,
  },
  high: {
    electricWindows: 'all',
    autoWindowClose: true,
    foldingMirrors: 'electric',
    heatedMirrors: true,
    heatedSeats: 'front',
    ventilatedSeats: 'none',
    electricSeats: 'driver+passenger',
    memorySeats: true,
    leatherSeats: true,
    sunroof: 'regular',
    climateControl: '2-zone',
    heatedSteeringWheel: true,
    electricTailgate: true,
    keylessEntry: true,
    pushButtonStart: true,
    remoteStart: false,
    ambientLighting: true,
  },
  luxury: {
    electricWindows: 'all',
    autoWindowClose: true,
    foldingMirrors: 'electric',
    heatedMirrors: true,
    heatedSeats: 'all',
    ventilatedSeats: 'front',
    electricSeats: 'driver+passenger',
    memorySeats: true,
    leatherSeats: true,
    sunroof: 'panoramic',
    climateControl: '3-zone',
    heatedSteeringWheel: true,
    electricTailgate: true,
    keylessEntry: true,
    pushButtonStart: true,
    remoteStart: true,
    ambientLighting: true,
  },
  sport: {
    electricWindows: 'all',
    autoWindowClose: true,
    foldingMirrors: 'electric',
    heatedMirrors: true,
    heatedSeats: 'front',
    ventilatedSeats: 'front',
    electricSeats: 'driver+passenger',
    memorySeats: true,
    leatherSeats: true,
    sunroof: 'none',
    climateControl: '2-zone',
    heatedSteeringWheel: true,
    electricTailgate: true,
    keylessEntry: true,
    pushButtonStart: true,
    remoteStart: false,
    ambientLighting: true,
  },
};

/**
 * תבנית אבזור בטיחות לפי רמת גימור
 */
export const SAFETY_BY_TRIM: Record<TrimLevel, SafetyFeatures> = {
  basic: {
    airbags: 6,
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
    parkingSensors: 'rear',
    camera360: false,
    reverseCamera: true,
    nightVision: false,
    headUpDisplay: false,
    tirePressureMonitor: true,
    isofixPoints: 2,
  },
  mid: {
    airbags: 6,
    abs: true,
    esp: true,
    tractionControl: true,
    blindSpotMonitor: true,
    laneDepartureWarning: true,
    laneKeepAssist: false,
    forwardCollisionWarning: true,
    automaticEmergencyBraking: true,
    adaptiveCruiseControl: false,
    rearCrossTrafficAlert: true,
    parkingSensors: 'front+rear',
    camera360: false,
    reverseCamera: true,
    nightVision: false,
    headUpDisplay: false,
    tirePressureMonitor: true,
    isofixPoints: 2,
  },
  high: {
    airbags: 7,
    abs: true,
    esp: true,
    tractionControl: true,
    blindSpotMonitor: true,
    laneDepartureWarning: true,
    laneKeepAssist: true,
    forwardCollisionWarning: true,
    automaticEmergencyBraking: true,
    adaptiveCruiseControl: true,
    rearCrossTrafficAlert: true,
    parkingSensors: 'front+rear',
    camera360: true,
    reverseCamera: true,
    nightVision: false,
    headUpDisplay: false,
    tirePressureMonitor: true,
    isofixPoints: 2,
  },
  luxury: {
    airbags: 8,
    abs: true,
    esp: true,
    tractionControl: true,
    blindSpotMonitor: true,
    laneDepartureWarning: true,
    laneKeepAssist: true,
    forwardCollisionWarning: true,
    automaticEmergencyBraking: true,
    adaptiveCruiseControl: true,
    rearCrossTrafficAlert: true,
    parkingSensors: 'front+rear',
    camera360: true,
    reverseCamera: true,
    nightVision: true,
    headUpDisplay: true,
    tirePressureMonitor: true,
    isofixPoints: 3,
  },
  sport: {
    airbags: 8,
    abs: true,
    esp: true,
    tractionControl: true,
    blindSpotMonitor: true,
    laneDepartureWarning: true,
    laneKeepAssist: true,
    forwardCollisionWarning: true,
    automaticEmergencyBraking: true,
    adaptiveCruiseControl: true,
    rearCrossTrafficAlert: true,
    parkingSensors: 'front+rear',
    camera360: true,
    reverseCamera: true,
    nightVision: false,
    headUpDisplay: true,
    tirePressureMonitor: true,
    isofixPoints: 2,
  },
};

/**
 * תבנית אבזור מולטימדיה לפי רמת גימור
 */
export const INFOTAINMENT_BY_TRIM: Record<TrimLevel, InfotainmentFeatures> = {
  basic: {
    screenSize: 7,
    digitalCluster: false,
    appleCarPlay: true,
    androidAuto: true,
    wirelessCarPlay: false,
    wirelessAndroidAuto: false,
    wirelessCharging: false,
    usbPorts: 2,
    usbCPorts: 0,
    bluetooth: true,
    navigation: false,
    soundSystem: 'Standard',
    speakers: 4,
    voiceControl: false,
    overTheAirUpdates: false,
  },
  mid: {
    screenSize: 8,
    digitalCluster: false,
    appleCarPlay: true,
    androidAuto: true,
    wirelessCarPlay: false,
    wirelessAndroidAuto: false,
    wirelessCharging: false,
    usbPorts: 2,
    usbCPorts: 1,
    bluetooth: true,
    navigation: true,
    soundSystem: 'Standard',
    speakers: 6,
    voiceControl: false,
    overTheAirUpdates: false,
  },
  high: {
    screenSize: 10.25,
    digitalCluster: true,
    appleCarPlay: true,
    androidAuto: true,
    wirelessCarPlay: true,
    wirelessAndroidAuto: true,
    wirelessCharging: true,
    usbPorts: 4,
    usbCPorts: 2,
    bluetooth: true,
    navigation: true,
    soundSystem: 'Premium',
    speakers: 10,
    voiceControl: true,
    overTheAirUpdates: false,
  },
  luxury: {
    screenSize: 12.3,
    digitalCluster: true,
    appleCarPlay: true,
    androidAuto: true,
    wirelessCarPlay: true,
    wirelessAndroidAuto: true,
    wirelessCharging: true,
    usbPorts: 4,
    usbCPorts: 3,
    bluetooth: true,
    navigation: true,
    soundSystem: 'Harman Kardon',
    speakers: 16,
    voiceControl: true,
    overTheAirUpdates: true,
  },
  sport: {
    screenSize: 10.25,
    digitalCluster: true,
    appleCarPlay: true,
    androidAuto: true,
    wirelessCarPlay: true,
    wirelessAndroidAuto: true,
    wirelessCharging: true,
    usbPorts: 4,
    usbCPorts: 2,
    bluetooth: true,
    navigation: true,
    soundSystem: 'Premium',
    speakers: 12,
    voiceControl: true,
    overTheAirUpdates: true,
  },
};

/**
 * תבנית אבזור נהיגה לפי רמת גימור
 */
export const DRIVING_BY_TRIM: Record<TrimLevel, DrivingFeatures> = {
  basic: {
    driveMode: ['Normal', 'Eco'],
    paddleShifters: false,
    adaptiveSuspension: false,
    allWheelDrive: false,
    electronicDifferential: false,
    hillStartAssist: true,
    hillDescentControl: false,
    autoPark: false,
    trailerAssist: false,
  },
  mid: {
    driveMode: ['Normal', 'Eco', 'Sport'],
    paddleShifters: false,
    adaptiveSuspension: false,
    allWheelDrive: false,
    electronicDifferential: false,
    hillStartAssist: true,
    hillDescentControl: false,
    autoPark: false,
    trailerAssist: false,
  },
  high: {
    driveMode: ['Comfort', 'Eco', 'Sport', 'Sport+'],
    paddleShifters: true,
    adaptiveSuspension: false,
    allWheelDrive: false,
    electronicDifferential: false,
    hillStartAssist: true,
    hillDescentControl: false,
    autoPark: true,
    trailerAssist: false,
  },
  luxury: {
    driveMode: ['Comfort', 'Eco', 'Sport', 'Sport+', 'Individual'],
    paddleShifters: true,
    adaptiveSuspension: true,
    allWheelDrive: true,
    electronicDifferential: false,
    hillStartAssist: true,
    hillDescentControl: true,
    autoPark: true,
    trailerAssist: true,
  },
  sport: {
    driveMode: ['Comfort', 'Sport', 'Sport+', 'Track'],
    paddleShifters: true,
    adaptiveSuspension: true,
    allWheelDrive: false,
    electronicDifferential: true,
    hillStartAssist: true,
    hillDescentControl: false,
    autoPark: true,
    trailerAssist: false,
  },
};

/**
 * תבנית אבזור תאורה לפי רמת גימור
 */
export const LIGHTING_BY_TRIM: Record<TrimLevel, LightingFeatures> = {
  basic: {
    headlights: 'Halogen',
    autoHighBeam: false,
    fogLights: false,
    daytimeRunningLights: true,
    ambientInteriorLighting: false,
    welcomeLights: false,
  },
  mid: {
    headlights: 'LED',
    autoHighBeam: false,
    fogLights: true,
    daytimeRunningLights: true,
    ambientInteriorLighting: false,
    welcomeLights: false,
  },
  high: {
    headlights: 'LED',
    autoHighBeam: true,
    fogLights: true,
    daytimeRunningLights: true,
    ambientInteriorLighting: true,
    welcomeLights: true,
  },
  luxury: {
    headlights: 'LED Matrix',
    autoHighBeam: true,
    fogLights: true,
    daytimeRunningLights: true,
    ambientInteriorLighting: true,
    welcomeLights: true,
  },
  sport: {
    headlights: 'LED Matrix',
    autoHighBeam: true,
    fogLights: true,
    daytimeRunningLights: true,
    ambientInteriorLighting: true,
    welcomeLights: true,
  },
};

/**
 * קבלת תבנית אבזור מלאה לפי רמת גימור
 */
export function getFeaturesByTrimLevel(trimLevel: TrimLevel): VersionFeatures {
  return {
    comfort: COMFORT_BY_TRIM[trimLevel],
    safety: SAFETY_BY_TRIM[trimLevel],
    infotainment: INFOTAINMENT_BY_TRIM[trimLevel],
    driving: DRIVING_BY_TRIM[trimLevel],
    lighting: LIGHTING_BY_TRIM[trimLevel],
  };
}

/**
 * ניחוש רמת גימור לפי שם הגרסה
 */
export function guessTrimLevel(versionName: string): TrimLevel {
  const lowerName = versionName.toLowerCase();
  
  // Sport/Performance
  if (
    lowerName.includes('sport') ||
    lowerName.includes('gt') ||
    lowerName.includes('rs') ||
    lowerName.includes('amg') ||
    lowerName.includes('m sport') ||
    lowerName.includes('competition') ||
    lowerName.includes('performance') ||
    lowerName.includes('type r') ||
    lowerName.includes('nismo') ||
    lowerName.includes('sti')
  ) {
    return 'sport';
  }
  
  // Luxury
  if (
    lowerName.includes('luxury') ||
    lowerName.includes('premium') ||
    lowerName.includes('exclusive') ||
    lowerName.includes('prestige') ||
    lowerName.includes('signature') ||
    lowerName.includes('ultimate') ||
    lowerName.includes('long range') ||
    lowerName.includes('executive') ||
    lowerName.includes('elegance') ||
    lowerName.includes('inscription')
  ) {
    return 'luxury';
  }
  
  // High
  if (
    lowerName.includes('plus') ||
    lowerName.includes('pro') ||
    lowerName.includes('advanced') ||
    lowerName.includes('limited') ||
    lowerName.includes('ltz') ||
    lowerName.includes('xlt') ||
    lowerName.includes('sel') ||
    lowerName.includes('touring')
  ) {
    return 'high';
  }
  
  // Mid
  if (
    lowerName.includes('comfort') ||
    lowerName.includes('style') ||
    lowerName.includes('lt') ||
    lowerName.includes('se') ||
    lowerName.includes('xle')
  ) {
    return 'mid';
  }
  
  // Basic
  if (
    lowerName.includes('base') ||
    lowerName.includes('basic') ||
    lowerName.includes('entry') ||
    lowerName.includes('l ') ||
    lowerName.includes('ls') ||
    lowerName.includes('le') ||
    lowerName.includes('s ') ||
    lowerName.endsWith(' s')
  ) {
    return 'basic';
  }
  
  // Default to mid
  return 'mid';
}

/**
 * מיפוי רמות גימור לפי יצרן
 * כל יצרן משתמש בשמות שונים לרמות הגימור שלו
 */
export const TRIM_LEVEL_MAPPINGS: Record<string, Record<string, TrimLevel>> = {
  'BMW': {
    'Advantage': 'basic',
    'Sport Line': 'mid',
    'Luxury': 'high',
    'M Sport': 'sport',
    'M': 'sport',
  },
  'Mercedes-Benz': {
    'Classic': 'basic',
    'Avantgarde': 'mid',
    'AMG Line': 'high',
    'AMG': 'sport',
    'Maybach': 'luxury',
  },
  'Audi': {
    'Basic': 'basic',
    'Design': 'mid',
    'S Line': 'high',
    'RS': 'sport',
  },
  'Toyota': {
    'Luna': 'basic',
    'Terra': 'mid',
    'Sol': 'high',
    'Premium': 'luxury',
    'GR': 'sport',
  },
  'Hyundai': {
    'Classic': 'basic',
    'Comfort': 'mid',
    'Premium': 'high',
    'Signature': 'luxury',
    'N Line': 'sport',
    'N': 'sport',
  },
  'Kia': {
    'LX': 'basic',
    'EX': 'mid',
    'SX': 'high',
    'GT-Line': 'sport',
    'GT': 'sport',
  },
};

/**
 * קבלת רמת גימור לפי יצרן ושם גרסה
 */
export function getTrimLevelForMake(make: string, versionName: string): TrimLevel {
  const makeMappings = TRIM_LEVEL_MAPPINGS[make];
  
  if (makeMappings) {
    for (const [trimName, level] of Object.entries(makeMappings)) {
      if (versionName.toLowerCase().includes(trimName.toLowerCase())) {
        return level;
      }
    }
  }
  
  // Fallback to general guess
  return guessTrimLevel(versionName);
}
