// Simple promise-based IDB
const dbPromise = indexedDB.open('fishfriend-db', 1, upgradeDB => {
  if (!upgradeDB.objectStoreNames.contains('fish')) {
    upgradeDB.createObjectStore('fish', { keyPath: 'id' });
  }
  if (!upgradeDB.objectStoreNames.contains('chats')) {
    upgradeDB.createObjectStore('chats', { keyPath: 'fishId' });
  }
  if (!upgradeDB.objectStoreNames.contains('meta')) {
    upgradeDB.createObjectStore('meta', { keyPath: 'key' });
  }
});

function idbGet(store, key) {
  return new Promise(resolve => {
    dbPromise.onsuccess = () => {
      const tx = dbPromise.result.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result);
    };
  });
}
function idbSet(store, val) {
  return new Promise(resolve => {
    dbPromise.onsuccess = () => {
      const tx = dbPromise.result.transaction(store, 'readwrite');
      tx.objectStore(store).put(val);
      tx.oncomplete = () => resolve();
    };
  });
}
function idbGetAll(store) {
  return new Promise(resolve => {
    dbPromise.onsuccess = () => {
      const tx = dbPromise.result.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
    };
  });
}
