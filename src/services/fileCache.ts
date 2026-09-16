/**
 * fileCache.ts
 * Cache em memória e IndexedDB para arquivos odontológicos (STL, DCM, PLY, OBJ)
 * Garante que arquivos carregados pelo cliente sejam imediatamente acessíveis no visualizador 3D.
 */

const DB_NAME = 'ImplantPrecisionFilesDB';
const STORE_NAME = 'files_store';
const DB_VERSION = 1;

// Cache rápido em memória para a sessão ativa
const memoryMap = new Map<string, File | Blob>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado neste ambiente.'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Armazena um arquivo (File ou Blob) associado a múltiplas chaves de busca
 * (ex: id do arquivo, nome do arquivo, URL de download, código do caso)
 */
export async function storeFileInCache(keys: (string | undefined)[], file: File | Blob): Promise<void> {
  const validKeys = keys
    .filter((k): k is string => Boolean(k && k.trim() && k !== '#'))
    .map(k => k.toLowerCase().trim());

  for (const k of validKeys) {
    memoryMap.set(k, file);
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const k of validKeys) {
      store.put(file, k);
    }
  } catch (err) {
    console.warn('[FileCache] Armazenamento IndexedDB não disponível (usando apenas memória):', err);
  }
}

/**
 * Recupera um arquivo do cache por qualquer uma das suas chaves conhecidas
 */
export async function getFileFromCache(key: string): Promise<File | Blob | null> {
  if (!key || key === '#') return null;
  const k = key.toLowerCase().trim();

  // 1. Tentar memória primeiro (instantâneo)
  if (memoryMap.has(k)) {
    return memoryMap.get(k)!;
  }

  // 2. Tentar IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(k);
      req.onsuccess = () => {
        const result = req.result as File | Blob | undefined;
        if (result) {
          memoryMap.set(k, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
