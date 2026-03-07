/**
 * Firebase Admin SDK Configuration
 * קונפיגורציה לגישת אדמין ל-Firebase
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminApp: App | null = null;
let adminDb: Database | null = null;

/**
 * אתחול Firebase Admin SDK
 */
export function initializeFirebaseAdmin(): { app: App; db: Database } {
  if (adminApp && adminDb) {
    return { app: adminApp, db: adminDb };
  }

  // טעינת service account
  const serviceAccountPath = join(process.cwd(), 'service-account.json');
  
  let serviceAccount;
  try {
    const fileContent = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
  } catch (error) {
    console.error('❌ Failed to load service-account.json');
    console.error('   Make sure the file exists in the project root');
    throw error;
  }

  // Database URL
  const databaseURL = 'https://car-in-one-click1-default-rtdb.europe-west1.firebasedatabase.app';

  // אתחול האפליקציה
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL,
    });
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getDatabase(adminApp);

  console.log('✅ Firebase Admin SDK initialized');
  
  return { app: adminApp, db: adminDb };
}

/**
 * קבלת reference למסד הנתונים
 */
export function getAdminDatabase(): Database {
  if (!adminDb) {
    const { db } = initializeFirebaseAdmin();
    return db;
  }
  return adminDb;
}
