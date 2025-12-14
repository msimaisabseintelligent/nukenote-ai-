import { BlockData, Edge, WorkspaceMetadata } from "../types";
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'nukenote-db';
const STORE_NAME = 'workspaces'; // Renamed from 'workspace' to plural
const OLD_STORE_NAME = 'workspace';
const DB_VERSION = 2; // Bumped version

export interface WorkspaceData {
  id: string;
  name: string;
  blocks: BlockData[];
  edges: Edge[];
  lastUpdated: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction!;

      // Migration: If old store exists, migrate data to new store
      let oldData: any = null;
      if (db.objectStoreNames.contains(OLD_STORE_NAME)) {
         const oldStore = transaction.objectStore(OLD_STORE_NAME);
         const getReq = oldStore.get('current');
         await new Promise<void>((res) => {
             getReq.onsuccess = () => {
                 oldData = getReq.result;
                 res();
             };
             getReq.onerror = () => res();
         });
         db.deleteObjectStore(OLD_STORE_NAME);
      }

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        
        // If we found old data, insert it into the new store
        if (oldData) {
            const newId = uuidv4();
            store.add({
                id: newId,
                name: 'Migrated Workspace',
                blocks: oldData.blocks || [],
                edges: oldData.edges || [],
                lastUpdated: Date.now()
            });
            // Also set this as the active one in localStorage so user doesn't get lost
            localStorage.setItem('nukenote-last-workspace-id', newId);
        }
      }
    };
  });
};

export const saveWorkspace = async (id: string, name: string, blocks: BlockData[], edges: Edge[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data: WorkspaceData = {
      id,
      name,
      blocks,
      edges,
      lastUpdated: Date.now()
    };

    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const loadWorkspace = async (id: string): Promise<WorkspaceData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
        resolve(request.result as WorkspaceData || null);
    };
  });
};

export const listWorkspaces = async (): Promise<WorkspaceMetadata[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('lastUpdated');
        const request = index.openCursor(null, 'prev'); // Newest first
        
        const workspaces: WorkspaceMetadata[] = [];
        
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                const { id, name, lastUpdated } = cursor.value;
                workspaces.push({ id, name, lastUpdated });
                cursor.continue();
            } else {
                resolve(workspaces);
            }
        };
        request.onerror = () => reject(request.error);
    });
};

export const deleteWorkspace = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};
