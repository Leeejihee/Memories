import { createClient, SupabaseClient } from '@supabase/supabase-js'
import exifr from 'exifr'

export interface ExifInfo {
  make?: string
  model?: string
  dateTimeOriginal?: string
  focalLength?: number
  fNumber?: number
  iso?: number
  exposureTime?: number | string
  latitude?: number
  longitude?: number
  software?: string
  imageWidth?: number
  imageHeight?: number
}

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
  user_id?: string
  exif_data?: ExifInfo | null
}

export interface AlbumItem {
  id: string
  name: string
  description?: string | null
  cover_media_id: string | null
  created_at: string
  user_id?: string
}

export interface UserAccount {
  id: string
  email: string
  name: string
  passwordHash: string
  avatar?: string
  createdAt: string
  supabaseConfig?: {
    url: string
    anonKey: string
    syncEnabled: boolean
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
}

// User accounts management in separate Auth store
const AUTH_STORAGE_KEY = 'mymemories_registered_accounts_v2'
const CURRENT_USER_KEY = 'mymemories_current_user_v2'

export function getAllRegisteredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAllRegisteredAccounts(accounts: UserAccount[]): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts))
}

export function getPersistedCurrentUser(): UserAccount | null {
  try {
    const sessionRaw = sessionStorage.getItem(CURRENT_USER_KEY)
    if (sessionRaw) return JSON.parse(sessionRaw)
    const localRaw = localStorage.getItem(CURRENT_USER_KEY)
    if (localRaw) return JSON.parse(localRaw)
    return null
  } catch {
    return null
  }
}

export function setPersistedCurrentUser(user: UserAccount | null, rememberOnDevice: boolean = true): void {
  try {
    if (user) {
      if (rememberOnDevice) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
        sessionStorage.removeItem(CURRENT_USER_KEY)
      } else {
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
        localStorage.removeItem(CURRENT_USER_KEY)
      }
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
      sessionStorage.removeItem(CURRENT_USER_KEY)
    }
  } catch (e) {
    console.warn('Cannot persist user session:', e)
  }
}

// Database helper with dynamic isolation per account
function getDatabaseName(userIdOrEmail: string): string {
  const sanitized = (userIdOrEmail || 'guest')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
  return `MyMemories_DB_${sanitized}`
}

const STORE_MEDIA = 'memories'
const STORE_ALBUMS = 'albums'
const STORE_META = 'metadata'

function openDBForAccount(userIdOrEmail: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB không được hỗ trợ trên trình duyệt này'))
      return
    }
    const dbName = getDatabaseName(userIdOrEmail)
    const request = indexedDB.open(dbName, 1)

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

// Media DB Functions
export async function getAllMediaFromDB(userId: string): Promise<MediaItem[]> {
  try {
    const db = await openDBForAccount(userId)
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MEDIA, 'readonly')
      const store = tx.objectStore(STORE_MEDIA)
      const request = store.getAll()
      request.onsuccess = () => {
        const list = (request.result as MediaItem[]) || []
        resolve(list)
      }
      request.onerror = () => resolve([])
    })
  } catch (err) {
    console.warn('Fallback to isolated localStorage for media:', err)
    const saved = localStorage.getItem(`mymemories_data_${userId}`)
    return saved ? JSON.parse(saved) : []
  }
}

export async function saveMediaItemToDB(item: MediaItem, userId: string): Promise<void> {
  try {
    const db = await openDBForAccount(userId)
    const tx = db.transaction(STORE_MEDIA, 'readwrite')
    const store = tx.objectStore(STORE_MEDIA)
    store.put({ ...item, user_id: userId })
  } catch (err) {
    console.error('Error saving media to IndexedDB:', err)
  }
}

export async function saveAllMediaToDB(items: MediaItem[], userId: string): Promise<void> {
  try {
    const db = await openDBForAccount(userId)
    const tx = db.transaction(STORE_MEDIA, 'readwrite')
    const store = tx.objectStore(STORE_MEDIA)
    // Clear and batch rewrite
    store.clear()
    for (const item of items) {
      store.put({ ...item, user_id: userId })
    }
  } catch (err) {
    console.error('Error saving all media:', err)
    // Local storage backup
    localStorage.setItem(`mymemories_data_${userId}`, JSON.stringify(items))
  }
}

export async function deleteMediaItemFromDB(id: string, userId: string): Promise<void> {
  try {
    const db = await openDBForAccount(userId)
    const tx = db.transaction(STORE_MEDIA, 'readwrite')
    const store = tx.objectStore(STORE_MEDIA)
    store.delete(id)
  } catch (err) {
    console.error('Error deleting media from IndexedDB:', err)
  }
}

// Album DB Functions
export async function getAllAlbumsFromDB(userId: string): Promise<AlbumItem[]> {
  try {
    const db = await openDBForAccount(userId)
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ALBUMS, 'readonly')
      const store = tx.objectStore(STORE_ALBUMS)
      const request = store.getAll()
      request.onsuccess = () => {
        const list = (request.result as AlbumItem[]) || []
        resolve(list)
      }
      request.onerror = () => resolve([])
    })
  } catch (err) {
    console.warn('Fallback to isolated localStorage for albums:', err)
    const saved = localStorage.getItem(`mymemories_albums_${userId}`)
    return saved ? JSON.parse(saved) : []
  }
}

export async function saveAllAlbumsToDB(albums: AlbumItem[], userId: string): Promise<void> {
  try {
    const db = await openDBForAccount(userId)
    const tx = db.transaction(STORE_ALBUMS, 'readwrite')
    const store = tx.objectStore(STORE_ALBUMS)
    store.clear()
    for (const album of albums) {
      store.put({ ...album, user_id: userId })
    }
  } catch (err) {
    console.error('Error saving albums to IndexedDB:', err)
    localStorage.setItem(`mymemories_albums_${userId}`, JSON.stringify(albums))
  }
}

export async function deleteAlbumFromDB(id: string, userId: string): Promise<void> {
  try {
    const db = await openDBForAccount(userId)
    const tx = db.transaction(STORE_ALBUMS, 'readwrite')
    const store = tx.objectStore(STORE_ALBUMS)
    store.delete(id)
  } catch (err) {
    console.error('Error deleting album:', err)
  }
}

// Clear account database completely
export async function clearAccountDatabase(userId: string): Promise<void> {
  try {
    const dbName = getDatabaseName(userId)
    indexedDB.deleteDatabase(dbName)
    localStorage.removeItem(`mymemories_data_${userId}`)
    localStorage.removeItem(`mymemories_albums_${userId}`)
  } catch (err) {
    console.error('Error clearing database:', err)
  }
}

// Image compression
export async function compressImageFile(file: File, maxDimension = 1800, quality = 0.88): Promise<string> {
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

// EXIF Reader (Exchangeable Image File Format)
export async function extractExifFromFile(file: File | Blob): Promise<ExifInfo | null> {
  try {
    const data = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      jfif: true
    })
    if (!data) return null

    let formattedDate = undefined
    if (data.DateTimeOriginal || data.CreateDate || data.ModifyDate) {
      const d = data.DateTimeOriginal || data.CreateDate || data.ModifyDate
      if (d instanceof Date && !isNaN(d.getTime())) {
        formattedDate = d.toISOString().slice(0, 10)
      } else if (typeof d === 'string') {
        const parts = d.split(' ')[0]?.replace(/:/g, '-')
        if (parts && parts.length === 10) formattedDate = parts
      }
    }

    return {
      make: data.Make || undefined,
      model: data.Model || undefined,
      dateTimeOriginal: formattedDate,
      focalLength: data.FocalLength || undefined,
      fNumber: data.FNumber || undefined,
      iso: data.ISO || undefined,
      exposureTime: data.ExposureTime ? (data.ExposureTime < 1 ? `1/${Math.round(1 / data.ExposureTime)}` : `${data.ExposureTime}s`) : undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
      software: data.Software || undefined,
      imageWidth: data.ImageWidth || data.ExifImageWidth || undefined,
      imageHeight: data.ImageHeight || data.ExifImageHeight || undefined
    }
  } catch (err) {
    console.warn('Could not parse EXIF data:', err)
    return null
  }
}

// Supabase Client Manager
export function createSupabaseInstance(url: string, anonKey: string): SupabaseClient | null {
  try {
    if (!url || !anonKey || !url.startsWith('https://')) return null
    return createClient(url.trim(), anonKey.trim())
  } catch (err) {
    console.error('Failed to init Supabase:', err)
    return null
  }
}

// URL Image Normalizer & Direct link resolver
export function normalizeImageUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  let url = rawUrl.trim().replace(/^["'<]|["'>]$/g, '')

  // 1. Google Drive Links
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?export=view&id=FILE_ID
  const gDriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)([a-zA-Z0-9_-]+)/)
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1]
    return `https://lh3.googleusercontent.com/d/${fileId}=w2048`
  }

  // 2. Google Photos direct links (photos.fife.usercontent.google.com, lh3.googleusercontent.com)
  if (url.includes('googleusercontent.com') || url.includes('photos.fife.usercontent.google.com')) {
    // If it has no size parameter, add high res parameter for best viewing
    if (!url.includes('=w') && !url.includes('=s') && !url.includes('?')) {
      return `${url}=w2048`
    }
    return url
  }

  // 3. Dropbox links
  if (url.includes('dropbox.com')) {
    if (url.includes('dl=0')) {
      return url.replace('dl=0', 'raw=1')
    }
    if (!url.includes('raw=1')) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}raw=1`
    }
    return url
  }

  // 4. Imgur links (imgur.com/abc -> i.imgur.com/abc.jpg)
  if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
    const imgurMatch = url.match(/imgur\.com\/(?:gallery\/|a\/)?([a-zA-Z0-9]+)/)
    if (imgurMatch && imgurMatch[1]) {
      return `https://i.imgur.com/${imgurMatch[1]}.jpg`
    }
  }

  // 5. Flickr static photo links or Postimg
  if (url.includes('postimg.cc') && !url.includes('i.postimg.cc')) {
    const postimgMatch = url.match(/postimg\.cc\/([a-zA-Z0-9]+)/)
    if (postimgMatch && postimgMatch[1]) {
      return `https://i.postimg.cc/${postimgMatch[1]}/image.jpg`
    }
  }

  return url
}

// Safe CORS Proxy Image Generator for anti-hotlink servers
export function getSafeProxyImageUrl(url: string): string {
  const normalized = normalizeImageUrl(url)
  if (!normalized || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return normalized
  }
  // Use high-performance wsrv.nl proxy as transparent fallback
  return `https://wsrv.nl/?url=${encodeURIComponent(normalized)}&default=${encodeURIComponent(normalized)}`
}

// Convert URL Image to Base64 (Local Offline Persistence)
export async function fetchImageAsBase64(imageUrl: string): Promise<{ dataUrl: string; exif?: ExifInfo | null }> {
  const normalized = normalizeImageUrl(imageUrl)

  // Try direct fetch first
  const tryFetch = async (targetUrl: string): Promise<Blob> => {
    const res = await fetch(targetUrl, {
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    })
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    return await res.blob()
  }

  let blob: Blob | null = null

  try {
    blob = await tryFetch(normalized)
  } catch {
    // If direct fetch fails due to CORS, use proxy
    try {
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(normalized)}&output=webp`
      blob = await tryFetch(proxyUrl)
    } catch {
      // Secondary fallback
      const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalized)}`
      blob = await tryFetch(proxyUrl2)
    }
  }

  if (!blob) {
    throw new Error('Không thể tải dữ liệu ảnh từ URL này')
  }

  // Extract EXIF if present
  let exif: ExifInfo | null = null
  try {
    exif = await extractExifFromFile(blob)
  } catch (e) {
    console.warn('Cannot extract EXIF from downloaded URL:', e)
  }

  // Convert blob to Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve({
        dataUrl: reader.result as string,
        exif
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(blob!)
  })
}

// Test Supabase Connection
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createSupabaseInstance(url, anonKey)
    if (!client) return { success: false, message: 'URL hoặc Anon Key không hợp lệ (URL phải bắt đầu bằng https://).' }

    // Try a simple ping / query
    const { error } = await client.from('memories').select('id').limit(1)
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, but connection is valid
        return {
          success: true,
          message: 'Kết nối Supabase thành công! Lưu ý: Bảng "memories" chưa có sẵn trên Supabase, bạn có thể tạo bảng hoặc chạy đồng bộ để tự động cập nhật.'
        }
      }
      return { success: false, message: `Lỗi Supabase: ${error.message}` }
    }
    return { success: true, message: 'Kết nối Supabase thành công! Dữ liệu sẵn sàng đồng bộ hai chiều.' }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Không thể kết nối đến máy chủ Supabase.' }
  }
}
