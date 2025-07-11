const { contextBridge, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const dotenvPath = path.resolve(process.cwd(), '.env');
require('dotenv').config({ path: dotenvPath });

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.CORE_FIREBASE_API_KEY,
  authDomain: process.env.CORE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.CORE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.CORE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.CORE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.CORE_FIREBASE_APP_ID
};

let db;
if (!getApps().length) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

async function getGamePlaceIds() {
  const snapshot = await getDocs(collection(db, 'games'));
  return snapshot.docs.map(doc => doc.data().placeId);
}

contextBridge.exposeInMainWorld('firebaseAPI', {
  getGamePlaceIds
});

// The thing yk yk
contextBridge.exposeInMainWorld('electronAPI', {
  openRoblox: (placeId) => {
    shell.openExternal(`roblox://placeId=${placeId}`);
  }
});

