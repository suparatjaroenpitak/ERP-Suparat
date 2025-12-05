// Minimal IndexedDB wrapper for saving POS drafts
const DB_NAME = 'erp_offline'
const STORE_DRAFTS = 'pos_drafts'
const VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveDraft(draft: any) {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_DRAFTS, 'readwrite')
    const store = tx.objectStore(STORE_DRAFTS)
    store.put(draft)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function listDrafts() {
  const db = await openDb()
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(STORE_DRAFTS, 'readonly')
    const store = tx.objectStore(STORE_DRAFTS)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function removeDraft(id: string) {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_DRAFTS, 'readwrite')
    const store = tx.objectStore(STORE_DRAFTS)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export default { saveDraft, listDrafts, removeDraft }
