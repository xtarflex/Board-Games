import { openDB } from 'idb';

const DB_NAME = 'NerdVault';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('match_archive')) {
        const store = db.createObjectStore('match_archive', { keyPath: 'id', autoIncrement: true });
        store.createIndex('gameType', 'gameType');
        store.createIndex('timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('user_profile')) {
        db.createObjectStore('user_profile', { keyPath: 'id' });
      }
    },
  });
};

export const saveMatch = async (matchData) => {
  const db = await initDB();
  const tx = db.transaction('match_archive', 'readwrite');
  const store = tx.objectStore('match_archive');
  await store.add({
    ...matchData,
    timestamp: Date.now(),
  });
  await tx.done;
};

export const getAllMatches = async () => {
  const db = await initDB();
  return db.getAllFromIndex('match_archive', 'timestamp');
};

export const getMatchesByType = async (gameType) => {
  const db = await initDB();
  const tx = db.transaction('match_archive', 'readonly');
  const index = tx.store.index('gameType');
  const matches = await index.getAll(gameType);
  return matches.sort((a, b) => b.timestamp - a.timestamp);
};

export const saveUserProfile = async (profileData) => {
  const db = await initDB();
  const tx = db.transaction('user_profile', 'readwrite');
  const store = tx.objectStore('user_profile');
  // Merge with existing profile if present
  const existing = await store.get('main_user') || {};
  await store.put({
    id: 'main_user',
    ...existing,
    ...profileData,
  });
  await tx.done;
};

export const getUserProfile = async () => {
  const db = await initDB();
  return db.get('user_profile', 'main_user');
};
