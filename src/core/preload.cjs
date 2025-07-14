const { contextBridge, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const dotenvPath = path.resolve(process.cwd(), '.env');
require('dotenv').config({ path: dotenvPath });

var webFrame = require('electron').webFrame;
webFrame.setVisualZoomLevelLimits(1, 1);

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyCIcbHj7iH2bz4W3koGDZbauxfCKkiyArg',
  authDomain: 'betterrobloxdiscovery.firebaseapp.com',
  projectId: 'betterrobloxdiscovery',
  storageBucket: 'betterrobloxdiscovery.firebasestorage.app',
  messagingSenderId: '564230962947',
  appId: '1:564230962947:web:7ee840bd9fdcee298bf336'
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

