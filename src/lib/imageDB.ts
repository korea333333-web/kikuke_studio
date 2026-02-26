/**
 * IndexedDB 기반 이미지 저장소
 * localStorage(5MB)와 달리 IndexedDB는 수백 MB를 저장할 수 있어
 * base64 이미지 데이터를 안전하게 보관합니다.
 */

const DB_NAME = 'kikuke-studio-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
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

/** 이미지 저장 (키: "scene-0", "cut-0-1" 등) */
export async function saveImage(key: string, dataUrl: string): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(dataUrl, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn('[ImageDB] 이미지 저장 실패:', e);
    }
}

/** 이미지 불러오기 */
export async function loadImage(key: string): Promise<string | null> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const request = tx.objectStore(STORE_NAME).get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn('[ImageDB] 이미지 불러오기 실패:', e);
        return null;
    }
}

/** 여러 이미지 한 번에 불러오기 */
export async function loadImages(keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            let completed = 0;

            keys.forEach(key => {
                const request = store.get(key);
                request.onsuccess = () => {
                    if (request.result) {
                        result[key] = request.result;
                    }
                    completed++;
                    if (completed === keys.length) resolve(result);
                };
                request.onerror = () => {
                    completed++;
                    if (completed === keys.length) resolve(result);
                };
            });

            if (keys.length === 0) resolve(result);
        });
    } catch (e) {
        console.warn('[ImageDB] 이미지 일괄 불러오기 실패:', e);
        return result;
    }
}

/** 특정 이미지 삭제 */
export async function deleteImage(key: string): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn('[ImageDB] 이미지 삭제 실패:', e);
    }
}

/** 모든 이미지 삭제 */
export async function clearAllImages(): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn('[ImageDB] 전체 이미지 삭제 실패:', e);
    }
}
