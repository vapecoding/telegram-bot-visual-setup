/**
 * Утилиты для работы с IndexedDB
 * Используется для автосохранения черновиков настроек бота
 */

const DB_NAME = 'TGBotSettingsDB';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const DRAFT_KEY = 'currentDraft';

/**
 * Типы данных для черновика
 */
export interface DraftData {
  botName: string;
  shortDescription: string;
  description: string;
  about: string;
  privacyPolicyUrl: string;
  firstMessageText: string;
  inlineButtonText: string;
  inlineButtonResponse: string;
  // Изображения хранятся как Data URLs
  avatarUrl: string | null;
  botPicUrl: string | null;
  // Метаданные
  savedAt: number; // timestamp
}

/**
 * Проверка поддержки IndexedDB в браузере
 */
export function isIndexedDBSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Инициализация базы данных
 * Создает object store, если он не существует
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Создаем object store, если он не существует
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Сохранение черновика в IndexedDB
 */
export async function saveDraft(data: DraftData): Promise<void> {
  if (!isIndexedDBSupported()) {
    console.warn('IndexedDB not supported, draft not saved');
    return;
  }

  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put({
        ...data,
        savedAt: Date.now()
      }, DRAFT_KEY);

      request.onsuccess = () => {
        db.close();
        resolve();
      };

      request.onerror = () => {
        db.close();
        reject(new Error('Failed to save draft'));
      };
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
}

/**
 * Загрузка черновика из IndexedDB
 */
export async function loadDraft(): Promise<DraftData | null> {
  if (!isIndexedDBSupported()) {
    return null;
  }

  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(DRAFT_KEY);

      request.onsuccess = () => {
        db.close();
        const draft = request.result as DraftData | undefined;
        resolve(draft || null);
      };

      request.onerror = () => {
        db.close();
        reject(new Error('Failed to load draft'));
      };
    });
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
}

/**
 * Удаление черновика из IndexedDB
 */
export async function clearDraft(): Promise<void> {
  if (!isIndexedDBSupported()) {
    return;
  }

  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(DRAFT_KEY);

      request.onsuccess = () => {
        db.close();
        resolve();
      };

      request.onerror = () => {
        db.close();
        reject(new Error('Failed to clear draft'));
      };
    });
  } catch (error) {
    console.error('Error clearing draft:', error);
    throw error;
  }
}

/**
 * Проверка наличия сохраненного черновика
 */
export async function hasDraft(): Promise<boolean> {
  const draft = await loadDraft();
  return draft !== null;
}
