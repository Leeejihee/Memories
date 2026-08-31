// IndexedDB Helper for high-capacity memory storage
export interface MediaItem {
  id: string
  file_name: string
  mime_type: string
  source: 'upload' | 'external_url' | 'preset'
  storage_key: string // Data URL or external link
  title: string | null
  description: string | null
  taken_at: string | null // YYYY-MM-DD
  ai_tags: string[] | null
  is_favorite?: boolean
  album_id?: string | null
  location?: string | null
  created_at: string
}

export interface AlbumItem {
  id: string
  name: string
  description?: string | null
  cover_media_id: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
}

const DB_NAME = 'MyMemories_DB'
const DB_VERSION = 1
const STORE_MEDIA = 'memories'
const STORE_ALBUMS = 'albums'
const STORE_META = 'metadata'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_ALBUMS)) {
        db.createObjectStore(STORE_ALBUMS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllMediaFromDB(userEmail: string): Promise<MediaItem[]> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MEDIA, 'readonly')
      const store = tx.objectStore(STORE_MEDIA)
      const request = store.getAll()
      request.onsuccess = () => {
        const list = (request.result as (MediaItem & { user_email?: string })[]) || []
        // Filter by user email (or unassigned/guest)
        const filtered = list.filter(item => !item.user_email || item.user_email === userEmail)
        resolve(filtered)
      }
      request.onerror = () => resolve([])
    })
  } catch {
    // Fallback to localStorage
    const saved = localStorage.getItem(`mymemories_data_${userEmail}`) || localStorage.getItem('mymemories_data')
    return saved ? JSON.parse(saved) : []
  }
}

export async function saveMediaItemToDB(item: MediaItem, userEmail: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_MEDIA, 'readwrite')
    const store = tx.objectStore(STORE_MEDIA)
    store.put({ ...item, user_email: userEmail })
  } catch (err) {
    console.error('Error saving media to IndexedDB:', err)
  }
}

export async function saveAllMediaToDB(items: MediaItem[], userEmail: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_MEDIA, 'readwrite')
    const store = tx.objectStore(STORE_MEDIA)
    // Clear and batch write or put
    for (const item of items) {
      store.put({ ...item, user_email: userEmail })
    }
  } catch (err) {
    console.error('Error saving all media:', err)
  }
}

export async function deleteMediaItemFromDB(id: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_MEDIA, 'readwrite')
    const store = tx.objectStore(STORE_MEDIA)
    store.delete(id)
  } catch (err) {
    console.error('Error deleting media from IndexedDB:', err)
  }
}

export async function getAllAlbumsFromDB(userEmail: string): Promise<AlbumItem[]> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ALBUMS, 'readonly')
      const store = tx.objectStore(STORE_ALBUMS)
      const request = store.getAll()
      request.onsuccess = () => {
        const list = (request.result as (AlbumItem & { user_email?: string })[]) || []
        const filtered = list.filter(item => !item.user_email || item.user_email === userEmail)
        resolve(filtered)
      }
      request.onerror = () => resolve([])
    })
  } catch {
    const saved = localStorage.getItem(`mymemories_albums_${userEmail}`) || localStorage.getItem('mymemories_albums')
    return saved ? JSON.parse(saved) : []
  }
}

export async function saveAllAlbumsToDB(albums: AlbumItem[], userEmail: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_ALBUMS, 'readwrite')
    const store = tx.objectStore(STORE_ALBUMS)
    for (const album of albums) {
      store.put({ ...album, user_email: userEmail })
    }
  } catch (err) {
    console.error('Error saving albums to IndexedDB:', err)
  }
}

export async function deleteAlbumFromDB(id: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_ALBUMS, 'readwrite')
    const store = tx.objectStore(STORE_ALBUMS)
    store.delete(id)
  } catch (err) {
    console.error('Error deleting album:', err)
  }
}

// Compress client uploaded images to preserve high visual quality with optimal storage
export async function compressImageFile(file: File, maxDimension = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL(file.type || 'image/jpeg', quality))
      }
      img.onerror = () => resolve(e.target?.result as string)
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
