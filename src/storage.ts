import type { CueProject } from './types';

const DB_NAME = 'cuebook-local';
const STORE = 'projects';
const DEMO_MODE = typeof location !== 'undefined'
  && (location.pathname.replace(/\/$/, '') === '/demo' || new URL(location.href).searchParams.get('demo') === '1');
let demoProject: CueProject | undefined;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
  });
}

export async function loadProject(): Promise<CueProject | undefined> {
  if (DEMO_MODE) return demoProject;
  const db = await openDatabase();
  return new Promise<CueProject | undefined>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get('current');
    request.onsuccess = () => resolve(request.result as CueProject | undefined);
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

export async function saveProject(project: CueProject): Promise<void> {
  if (DEMO_MODE) {
    demoProject = { ...project, updatedAt: new Date().toISOString() };
    return;
  }
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put({ ...project, updatedAt: new Date().toISOString() });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function clearProject(): Promise<void> {
  if (DEMO_MODE) {
    demoProject = undefined;
    return;
  }
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete('current');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export function isDemoMode(): boolean {
  return DEMO_MODE;
}
