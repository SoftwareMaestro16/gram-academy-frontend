import { useEffect, useState } from "react";

/**
 * Caches a remote image (the Telegram avatar CDN URL, in practice) in
 * IndexedDB keyed by its URL, so a fresh Telegram Mini App WebView session
 * doesn't visibly re-fetch it on every reopen — WebViews don't reliably keep
 * the browser HTTP cache across closes. Only re-fetches when `url` changes
 * (e.g. the user's Telegram photo actually changed) or the entry is missing.
 * Returns an object-URL `src` once available, or `null` while loading, on
 * failure, or when `url` is null — callers should fall back to e.g. initials.
 */
export function useCachedImage(url: string | null): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setSrc(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        let blob = await readCachedBlob(url);
        if (!blob) {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`image fetch failed: ${response.status}`);
          blob = await response.blob();
          await writeCachedBlob(url, blob);
        }
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return src;
}

// --- IndexedDB-backed blob cache, keyed by source URL -----------------------
// A blob keeps a small avatar thumbnail out of localStorage's string-only,
// same-thread-blocking storage, and needs no base64 inflation.

const DB_NAME = "gram-academy-image-cache";
const STORE_NAME = "images";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCachedBlob(url: string): Promise<Blob | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(url);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function writeCachedBlob(url: string, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, url);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
