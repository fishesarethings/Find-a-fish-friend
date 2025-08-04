const dbPromise = indexedDB.open('fishfriend-db', 1, upgrade => {
  if (!upgrade.objectStoreNames.contains('fish')) upgrade.createObjectStore('fish', { keyPath: 'id' });
  if (!upgrade.objectStoreNames.contains('meta')) upgrade.createObjectStore('meta', { keyPath: 'key' });
});

function idbGet(store, key) {
  return new Promise(res => {
    dbPromise.onsuccess = () => {
      const tx = dbPromise.result.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => res(req.result);
    };
  });
}
function idbSet(store, val) {
  return new Promise(res => {
    dbPromise.onsuccess = () => {
      const tx = dbPromise.result.transaction(store, 'readwrite');
      tx.objectStore(store).put(val);
      tx.oncomplete = () => res();
    };
  });
}
