console.log(`
                                             
 _____ _____ _____ __    _____ _____ ____  
|  _  | __  |   __|  |  |     |  _  |    \ 
|   __|    -|   __|  |__|  |  |     |  |  |
|__|  |__|__|_____|_____|_____|__|__|____/ 
                                           
  `)

const { contextBridge, shell, ipcMain, ipcRenderer } = require('electron');
const path = require('path');
const https = require('https');
const { mkdirSync, existsSync, createWriteStream, unlinkSync } = require('fs');
const Database = require('better-sqlite3');

const dotenvPath = path.resolve(process.cwd(), '.env');
require('dotenv').config({ path: dotenvPath });

var webFrame = require('electron').webFrame;
webFrame.setVisualZoomLevelLimits(1, 1);

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, deleteDoc, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.CORE_CIREBASE_API_KEY,
  authDomain: process.env.CORE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.CORE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.CORE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.CORE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.CORE_FIREBASE_APP_ID
};

let firestore;
if (!getApps().length) {
  const app = initializeApp(firebaseConfig);
  firestore = getFirestore(app);
}

// Paths
const IMAGE_DIR = path.join(__dirname, '../cache/images');
const DB_PATH = path.join(__dirname, '../cache/rofind.db');

mkdirSync(IMAGE_DIR, { recursive: true });
mkdirSync(path.dirname(DB_PATH), { recursive: true });

// SQLite
const sqlite = new Database(DB_PATH);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS games (
    placeId     TEXT PRIMARY KEY,
    universeId  TEXT,
    name        TEXT,
    description TEXT,
    author      TEXT,
    verified    INTEGER,
    rating      REAL,
    imagePath   TEXT,
    fetchedAt   INTEGER
  );
`);

const TTL_MS = 1000 * 60 * 60;

function isExpired(fetchedAt) {
  return Date.now() - fetchedAt > TTL_MS;
}

// Images
function downloadImage(url, universeId) {
  return new Promise((resolve, reject) => {
    const dest = path.join(IMAGE_DIR, `thumb_${universeId}.jpg`);
    if (existsSync(dest)) return resolve(dest);
    const file = createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', reject);
  });
}

// Firebase
async function getGamePlaceIds() {
  const snapshot = await getDocs(collection(firestore, 'games'));
  return snapshot.docs.map(doc => doc.data().placeId);
}

async function getGameDetails(placeId) {
  const snapshot = await getDocs(collection(firestore, 'games'));
  const doc = snapshot.docs.find(d => d.data().placeId === placeId);
  return doc ? doc.data() : null;
}

async function submitGame({ name, description, placeId, author }) {
  await addDoc(collection(firestore, 'submissions'), {
    name,
    description,
    placeId,
    author,
    submittedAt: Date.now(),
    verified: false
  });
}

async function deleteGame(placeId) {
  const q = query(collection(firestore, 'games'), where('placeId', '==', placeId));
  const snapshot = await getDocs(q);
  snapshot.docs.forEach(doc => deleteDoc(doc.ref));
}

// Expose
contextBridge.exposeInMainWorld('firebaseAPI', {
  getGamePlaceIds,
  getGameDetails,
  submitGame,
  deleteGame,
});

contextBridge.exposeInMainWorld('cacheDB', {
  getGame: (placeId) => {
    const row = sqlite.prepare('SELECT * FROM games WHERE placeId = ?').get(placeId);
    if (!row || isExpired(row.fetchedAt)) return null;
    console.log(`[DB CACHE HIT] placeId: ${placeId}`);
    return row;
  },

  saveGame: async (game, imageUrl) => {
    const imagePath = await downloadImage(imageUrl, game.universeId);
    sqlite.prepare(`
      INSERT INTO games (placeId, universeId, name, description, author, verified, rating, imagePath, fetchedAt)
      VALUES (@placeId, @universeId, @name, @description, @author, @verified, @rating, @imagePath, @fetchedAt)
      ON CONFLICT(placeId) DO UPDATE SET
        universeId  = @universeId,
        name        = @name,
        description = @description,
        author      = @author,
        verified    = @verified,
        rating      = @rating,
        imagePath   = @imagePath,
        fetchedAt   = @fetchedAt
    `).run({ ...game, imagePath, fetchedAt: Date.now() });
  },

  deleteGame: (placeId) => {
    const row = sqlite.prepare('SELECT imagePath FROM games WHERE placeId = ?').get(placeId);
    if (row?.imagePath && existsSync(row.imagePath)) unlinkSync(row.imagePath);
    sqlite.prepare('DELETE FROM games WHERE placeId = ?').run(placeId);
  },

  getAllPlaceIds: () => {
    return sqlite.prepare('SELECT placeId FROM games').all().map(r => r.placeId);
  }
});

contextBridge.exposeInMainWorld('imageAPI', {
  download: (url, universeId) => downloadImage(url, universeId),
});

contextBridge.exposeInMainWorld('electronAPI', {
  openRoblox: (placeId) => shell.openExternal(`roblox://placeId=${placeId}`),
});

contextBridge.exposeInMainWorld('oauthAPI', {
  loginRoblox: () => ipcRenderer.invoke('oauth:roblox')
});