const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let credential;
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require('./firebase-service-account.json');
  credential = admin.credential.cert(serviceAccount);
  console.log('Firebase Admin initialized with service account file');
} else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  });
  console.log('Firebase Admin initialized with environment variables');
} else {
  console.warn('Firebase Admin credentials not found. Authentication middleware will be disabled.');
  console.warn('   To enable authentication:');
  console.warn('   1. Download service account key from Firebase Console');
  console.warn('   2. Save as backend/config/firebase-service-account.json');
  console.warn('   OR set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in .env');
  credential = null;
}

if (credential) {
  admin.initializeApp({
    credential: credential,
    projectId: process.env.FIREBASE_PROJECT_ID || 'movie-rate-870dd'
  });
} else {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'movie-rate-870dd'
  });
}

const db = credential ? admin.firestore() : null;

const auth = credential ? admin.auth() : null;

module.exports = { admin, db, auth, isConfigured: !!credential };