import { BlockData, Edge } from "../types";

const DB_NAME = 'nukenote-db';
const STORE_NAME = 'workspace';
const DB_VERSION = 1;

export interface WorkspaceData {
  blocks: BlockData[];
  edges: Edge[];
  lastUpdated: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveWorkspace = async (blocks: BlockData[], edges: Edge[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data: WorkspaceData & { id: string } = {
      id: 'current', // Singleton record
      blocks,
      edges,
      lastUpdated: Date.now()
    };

    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const loadWorkspace = async (): Promise<WorkspaceData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
        if (request.result) {
            resolve(request.result as WorkspaceData);
        } else {
            // Migration Strategy: Check LocalStorage if DB is empty
            const localData = localStorage.getItem('nukenote-data');
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    resolve({ blocks: parsed.blocks || [], edges: parsed.edges || [], lastUpdated: Date.now() });
                } catch (e) {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        }
    };
  });
};