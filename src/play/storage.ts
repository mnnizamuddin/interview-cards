import { emptyProgress, isProgress, type Progress } from './progress.ts';

/**
 * Keeps the progress document in IndexedDB, on this device only. One object store, one key:
 * the whole document is small enough to read and write at once.
 */

const DB_NAME = 'interview-cards';
const STORE = 'kv';
const KEY = 'progress';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = action(transaction.objectStore(STORE));
        transaction.oncomplete = () => {
          db.close();
          resolve(request.result);
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      }),
  );
}

export async function loadProgress(): Promise<Progress> {
  const stored: unknown = await run('readonly', (store) => store.get(KEY));
  return isProgress(stored) ? stored : emptyProgress();
}

export async function saveProgress(progress: Progress): Promise<void> {
  await run('readwrite', (store) => store.put(progress, KEY));
}

/**
 * Asks the browser not to evict this site's storage under pressure. Browsers may refuse;
 * the export button stays the real backup.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) {
    return false;
  }
  return navigator.storage.persist();
}
