// preload.cjs

const { contextBridge, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const dotenvPath = path.resolve(process.cwd(), '.env');
require('dotenv').config({ path: dotenvPath });

var webFrame = require('electron').webFrame;
webFrame.setVisualZoomLevelLimits(1, 1);

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.CORE_CIREBASE_API_KEY,
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

// Caching
const CACHE_FILE = path.join(__dirname, '../cache/', 'game-cache.json');
const TTL_MS = 1000 * 60 * 60; // 1 hour

function loadCache() {
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
}

let gameCache = loadCache();

// Firebase
async function getGamePlaceIds() {
  const cached = gameCache['placeIds'];
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return cached.data;
  }

  const snapshot = await getDocs(collection(db, 'games'));
  const data = snapshot.docs.map(doc => doc.data().placeId);

  gameCache['placeIds'] = { data, fetchedAt: Date.now() };
  saveCache(gameCache);
  return data;
}

async function getGameDetails(placeId) {
  const cached = gameCache[placeId];
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return cached.data;
  }

  const snapshot = await getDocs(collection(db, 'games'));
  const doc = snapshot.docs.find(d => d.data().placeId === placeId);
  const data = doc ? doc.data() : null;

  if (data) {
    gameCache[placeId] = { data, fetchedAt: Date.now() };
    saveCache(gameCache);
  }

  return data;
}

// Submission Template
async function submitGame({ name, description, placeId, author }) {
  await addDoc(collection(db, 'submissions'), {
    name,
    description,
    placeId,
    author,
    submittedAt: Date.now(),
    verified: false
  });
}

// Expose
contextBridge.exposeInMainWorld('firebaseAPI', {
  getGamePlaceIds,
  getGameDetails,
  submitGame,
});

contextBridge.exposeInMainWorld('electronAPI', {
  openRoblox: (placeId) => {
    shell.openExternal(`roblox://placeId=${placeId}`);
  }
});