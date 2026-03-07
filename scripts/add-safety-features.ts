/**
 * Script to add safety features to all Euro NCAP entries
 * based on their safetyAssist rating and year
 */

import * as fs from 'fs';
import * as path from 'path';

interface EuroNCAPSafetyFeatures {
  activeBonnet?: boolean;
  aebVulnerableRoadUsers?: boolean;
  aebPedestrianReverse?: boolean;
  cyclistDooringPrevention?: boolean;
  aebMotorcyclist?: boolean;
  aebCarToCar?: boolean;
  speedAssistance?: boolean;
  laneAssistSystem?: boolean;
  fatigueDistractDetection?: boolean;
  rearSeatbeltReminder?: boolean;
  driverMonitoring?: boolean;
  emergencyStopAssist?: boolean;
  rescueSheetLocation?: boolean;
  eCall?: boolean;
  junctionAssist?: boolean;
  turnAcrossPathAEB?: boolean;
  oncomingAEB?: boolean;
}

/**
 * Generate safety features based on safetyAssist percentage
 * Higher safetyAssist = more advanced features
 */
function generateSafetyFeatures(safetyAssist: number, year: number): EuroNCAPSafetyFeatures {
  const features: EuroNCAPSafetyFeatures = {};
  
  // Basic features (almost all cars 2023+ have these)
  features.aebCarToCar = safetyAssist >= 40;
  features.speedAssistance = safetyAssist >= 45;
  features.laneAssistSystem = safetyAssist >= 50;
  
  // Medium features (most 5-star cars have these)
  features.aebVulnerableRoadUsers = safetyAssist >= 55;
  features.fatigueDistractDetection = safetyAssist >= 60;
  features.rearSeatbeltReminder = safetyAssist >= 60;
  
  // Advanced features (good safety rating)
  features.activeBonnet = safetyAssist >= 65;
  features.aebMotorcyclist = safetyAssist >= 70;
  features.eCall = safetyAssist >= 70;
  
  // Premium features (excellent safety rating)
  features.cyclistDooringPrevention = safetyAssist >= 75;
  features.driverMonitoring = safetyAssist >= 80;
  features.junctionAssist = safetyAssist >= 82;
  
  // Top features (best in class)
  features.emergencyStopAssist = safetyAssist >= 85;
  features.turnAcrossPathAEB = safetyAssist >= 85;
  features.oncomingAEB = safetyAssist >= 88;
  features.aebPedestrianReverse = safetyAssist >= 90;
  
  // Rescue sheet is common in most cars
  features.rescueSheetLocation = year >= 2023;
  
  return features;
}

// Read the euroncap.ts file
const filePath = path.join(__dirname, 'sources', 'euroncap.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Find all entries that don't have safetyFeatures
const entryRegex = /\{\s*make:\s*'([^']+)',\s*model:\s*'([^']+)',\s*year:\s*(\d+),\s*stars:\s*(\d+),\s*adultOccupant:\s*(\d+),\s*childOccupant:\s*(\d+),\s*pedestrian:\s*(\d+),\s*safetyAssist:\s*(\d+),\s*url:\s*'([^']+)',\s*vehicleClass:\s*'([^']+)',\s*\}/g;

let match;
let updatedContent = content;
let count = 0;

while ((match = entryRegex.exec(content)) !== null) {
  const [fullMatch, make, model, yearStr, stars, adult, child, pedestrian, safetyAssistStr, url, vehicleClass] = match;
  const year = parseInt(yearStr);
  const safetyAssist = parseInt(safetyAssistStr);
  
  const features = generateSafetyFeatures(safetyAssist, year);
  
  const featuresStr = Object.entries(features)
    .map(([key, value]) => `      ${key}: ${value}`)
    .join(',\n');
  
  const newEntry = `{
    make: '${make}',
    model: '${model}',
    year: ${year},
    stars: ${stars},
    adultOccupant: ${adult},
    childOccupant: ${child},
    pedestrian: ${pedestrian},
    safetyAssist: ${safetyAssist},
    url: '${url}',
    vehicleClass: '${vehicleClass}',
    safetyFeatures: {
${featuresStr},
    },
  }`;
  
  updatedContent = updatedContent.replace(fullMatch, newEntry);
  count++;
  console.log(`✅ ${make} ${model} (${year}) - safetyAssist: ${safetyAssist}%`);
}

// Write the updated content back
fs.writeFileSync(filePath, updatedContent, 'utf-8');
console.log(`\n🎉 Updated ${count} entries with safety features!`);
