import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileDown,
  FileUp,
  FolderOpen,
  FolderPlus,
  Heart,
  Home,
  Image as ImageIcon,
  KeyRound,
  Link as LinkIcon,
  Lock,
  LogOut,
  Maximize2,
  Menu,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  X
} from 'lucide-react'
import {
  AlbumItem,
  ExifInfo,
  MediaItem,
  UserAccount,
  UserProfile,
  clearAccountDatabase,
  compressImageFile,
  createSupabaseInstance,
  deleteAlbumFromDB,
  deleteMediaItemFromDB,
  extractExifFromFile,
  fetchImageAsBase64,
  getAllAlbumsFromDB,
  getAllMediaFromDB,
  getAllRegisteredAccounts,
  getPersistedCurrentUser,
  getSafeProxyImageUrl,
  isGooglePhotosWebPage,
  normalizeImageUrl,
  saveAllAlbumsToDB,
  saveAllMediaToDB,
  saveAllRegisteredAccounts,
  saveMediaItemToDB,
  setPersistedCurrentUser,
  testSupabaseConnection,
  tryResolveGooglePhotosDirectLink
} from './db'
import './styles.css'

// Robust SmartImage component with automatic no-referrer, multi-proxy fallbacks for CORS/hotlink protection, and Google Photos auto-resolution
function SmartImage({
  src,
  alt = 'Memory',
  className,
  style,
  loading = 'lazy',
  onClick,
  onLoad,
  onError
}: {
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void
  onLoad?: () => void
  onError?: () => void
}) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => normalizeImageUrl(src || ''))
  const [fallbackAttempt, setFallbackAttempt] = useState<number>(0)
  const [hasError, setHasError] = useState(false)
  const [isResolvingGPhotos, setIsResolvingGPhotos] = useState(false)

  useEffect(() => {
    let active = true
    const init = async () => {
      const normalized = normalizeImageUrl(src || '')
      if (isGooglePhotosWebPage(normalized)) {
        setIsResolvingGPhotos(true)
        const resolved = await tryResolveGooglePhotosDirectLink(normalized)
        if (active && resolved) {
          setCurrentSrc(resolved)
          setIsResolvingGPhotos(false)
          return
        }
        if (active) setIsResolvingGPhotos(false)
      }
      if (active) {
        setCurrentSrc(normalized)
      }
    }
    setFallbackAttempt(0)
    setHasError(false)
    init()
    return () => { active = false }
  }, [src])

  const handleImgError = () => {
    const rawNormalized = normalizeImageUrl(src || '')
    if (fallbackAttempt === 0 && currentSrc && !currentSrc.startsWith('data:') && !currentSrc.startsWith('blob:')) {
      setFallbackAttempt(1)
      setCurrentSrc(`https://wsrv.nl/?url=${encodeURIComponent(rawNormalized)}&output=webp`)
    } else if (fallbackAttempt === 1 && currentSrc && !currentSrc.startsWith('data:')) {
      setFallbackAttempt(2)
      setCurrentSrc(`https://images.weserv.nl/?url=${encodeURIComponent(rawNormalized)}`)
    } else if (fallbackAttempt === 2 && currentSrc && !currentSrc.startsWith('data:')) {
      setFallbackAttempt(3)
      setCurrentSrc(`https://api.allorigins.win/raw?url=${encodeURIComponent(rawNormalized)}`)
    } else if (fallbackAttempt === 3 && currentSrc && !currentSrc.startsWith('data:')) {
      setFallbackAttempt(4)
      setCurrentSrc(`https://corsproxy.io/?${encodeURIComponent(rawNormalized)}`)
    } else {
      setHasError(true)
      if (onError) onError()
    }
  }

  if (hasError || !currentSrc) {
    const isGPhotosPage = isGooglePhotosWebPage(src)
    return (
      <div
        className={`image-error-box ${className || ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ede8df',
          color: '#847c72',
          fontSize: '11px',
          padding: '10px',
          textAlign: 'center',
          gap: '4px',
          height: '100%',
          width: '100%',
          borderRadius: 'inherit',
          ...style
        }}
        onClick={onClick as any}
      >
        <ImageIcon size={22} style={{ opacity: 0.6 }} />
        <span>{isGPhotosPage ? 'Link trang Google Photos (Cần link ảnh trực tiếp)' : 'Không thể hiển thị ảnh'}</span>
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      loading={loading}
      onLoad={onLoad}
      onError={handleImgError}
      onClick={onClick}
    />
  )
}

// Default account seed if none exists
const defaultRegisteredAccount: UserAccount = {
  id: 'usr_thanhyen',
  email: 's2thanhyens2@gmail.com',
  name: 'Thanh Yến',
  passwordHash: '123456',
  createdAt: '2024-01-01T00:00:00Z'
}

function App() {
  // Accounts & Authentication State (Isolated per machine / browser session)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    // Seed default account to accounts list if first time on this browser
    const all = getAllRegisteredAccounts()
    if (all.length === 0) {
      saveAllRegisteredAccounts([defaultRegisteredAccount])
    }
    // Return active session on this device/browser (null if logged out or fresh device)
    return getPersistedCurrentUser()
  })

  // Device Session Persistence Option
  const [rememberDeviceOption, setRememberDeviceOption] = useState<boolean>(true)

  // Auth Portal & Modal States
  const [authPortalTab, setAuthPortalTab] = useState<'login' | 'register'>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'profile' | 'change_password' | 'switch_account' | 'supabase'>('profile')
  const [authLoginForm, setAuthLoginForm] = useState({ email: '', password: '' })
  const [authRegisterForm, setAuthRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [authPasswordForm, setAuthPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [authProfileForm, setAuthProfileForm] = useState({ name: currentUser?.name || '' })
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  // App Data (isolated per currentUser.id)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [albums, setAlbums] = useState<AlbumItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'home' | 'media' | 'albums' | 'favorites' | 'timeline' | 'ai' | 'settings'>('home')
  const [query, setQuery] = useState('')
  const [aiSearchInput, setAiSearchInput] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)

  // Modals
  const [detailMemory, setDetailMemory] = useState<MediaItem | null>(null)
  const [editingMemory, setEditingMemory] = useState<MediaItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddAlbumModal, setShowAddAlbumModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [slideshowActive, setSlideshowActive] = useState(false)

  // Upload state
  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device')
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; file_name: string; exif?: ExifInfo | null }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [parseExifOption, setParseExifOption] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backupInputRef = useRef<HTMLInputElement>(null)

  // URL Photo state
  const [urlInputText, setUrlInputText] = useState('')
  const [urlPreviewStatus, setUrlPreviewStatus] = useState<'idle' | 'loading' | 'valid' | 'error'>('idle')
  const [urlDetectedSource, setUrlDetectedSource] = useState<string>('')
  const [urlOfflineSaveOption, setUrlOfflineSaveOption] = useState<boolean>(true)
  const [urlForm, setUrlForm] = useState({
    title: '',
    description: '',
    location: '',
    taken_at: new Date().toISOString().slice(0, 10),
    tags: '',
    album_id: ''
  })

  // Album creation form
  const [albumForm, setAlbumForm] = useState({
    name: '',
    description: ''
  })

  // Supabase Configuration State
  const [supabaseForm, setSupabaseForm] = useState({
    url: currentUser?.supabaseConfig?.url || '',
    anonKey: currentUser?.supabaseConfig?.anonKey || '',
    syncEnabled: currentUser?.supabaseConfig?.syncEnabled || false
  })
  const [supabaseTesting, setSupabaseTesting] = useState(false)
  const [supabaseStatus, setSupabaseStatus] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' })
  const [supabaseSyncing, setSupabaseSyncing] = useState(false)

  // Update Page Title: "<Tên người dùng> - Memories Tìm kỷ niệm nhanh"
  useEffect(() => {
    if (currentUser) {
      document.title = `${currentUser.name} - Memories Tìm kỷ niệm nhanh`
      setAuthProfileForm({ name: currentUser.name })
      setSupabaseForm({
        url: currentUser.supabaseConfig?.url || '',
        anonKey: currentUser.supabaseConfig?.anonKey || '',
        syncEnabled: currentUser.supabaseConfig?.syncEnabled || false
      })
    } else {
      document.title = 'Memories - Tìm kỷ niệm nhanh'
    }
  }, [currentUser])

  // Load isolated data from IndexedDB upon User Change (NO default seeded images)
  useEffect(() => {
    if (!currentUser) {
      setMedia([])
      setAlbums([])
      setIsLoaded(false)
      return
    }

    let isMounted = true
    async function loadData() {
      if (!currentUser) return
      setIsLoaded(false)
      const userMedia = await getAllMediaFromDB(currentUser.id)
      const userAlbums = await getAllAlbumsFromDB(currentUser.id)
      if (!isMounted) return
      setMedia(userMedia)
      setAlbums(userAlbums)
      setIsLoaded(true)
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  // Save changes to isolated database
  useEffect(() => {
    if (isLoaded && currentUser) {
      saveAllMediaToDB(media, currentUser.id)
    }
  }, [media, isLoaded, currentUser?.id])

  useEffect(() => {
    if (isLoaded && currentUser) {
      saveAllAlbumsToDB(albums, currentUser.id)
    }
  }, [albums, isLoaded, currentUser?.id])

  // Auto slideshow runner
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (slideshowActive && detailMemory) {
      timer = setInterval(() => {
        handleNextDetail()
      }, 3500)
    }
    return () => clearInterval(timer)
  }, [slideshowActive, detailMemory, media])

  // Toast notification helper
  const showToast = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3500)
  }

  // All extracted tags and years
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    media.forEach(m => m.ai_tags?.forEach(t => tagSet.add(t.trim())))
    return Array.from(tagSet).filter(Boolean)
  }, [media])

  const allYears = useMemo(() => {
    const years = new Set<string>()
    media.forEach(m => {
      if (m.taken_at && m.taken_at.length >= 4) {
        years.add(m.taken_at.slice(0, 4))
      }
    })
    return Array.from(years).sort().reverse()
  }, [media])

  // "On This Day" (Ngày này năm xưa)
  const onThisDayMemories = useMemo(() => {
    const today = new Date()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const matchSuffix = `-${month}-${day}`
    const currentYear = String(today.getFullYear())

    return media.filter(m => m.taken_at && m.taken_at.endsWith(matchSuffix) && !m.taken_at.startsWith(currentYear))
  }, [media])

  // Filtering memories based on tab, search query, AI query, tags, year, album
  const filteredMedia = useMemo(() => {
    let list = [...media]

    // Tab based filter
    if (activeTab === 'favorites') {
      list = list.filter(m => m.is_favorite)
    } else if (activeTab === 'albums' && selectedAlbumId) {
      list = list.filter(m => m.album_id === selectedAlbumId)
    }

    // Tag filter
    if (selectedTag) {
      list = list.filter(m => m.ai_tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase()))
    }

    // Year filter
    if (selectedYear) {
      list = list.filter(m => m.taken_at?.startsWith(selectedYear))
    }

    // Search Box query
    if (query.trim()) {
      const q = query.toLowerCase().trim()
      list = list.filter(m => {
        const titleMatch = m.title?.toLowerCase().includes(q)
        const descMatch = m.description?.toLowerCase().includes(q)
        const locMatch = m.location?.toLowerCase().includes(q)
        const tagMatch = m.ai_tags?.some(t => t.toLowerCase().includes(q))
        const cameraMatch = m.exif_data?.model?.toLowerCase().includes(q) || m.exif_data?.make?.toLowerCase().includes(q)
        return titleMatch || descMatch || locMatch || tagMatch || cameraMatch
      })
    }

    // AI free-form search query
    if (aiSearchInput.trim()) {
      const aiQ = aiSearchInput.toLowerCase().trim()
      const terms = aiQ.split(/\s+/).filter(Boolean)
      list = list.filter(m => {
        const fullText = `${m.title || ''} ${m.description || ''} ${m.location || ''} ${(m.ai_tags || []).join(' ')} ${m.taken_at || ''} ${m.exif_data?.model || ''} ${m.exif_data?.make || ''}`.toLowerCase()
        return terms.some(t => fullText.includes(t))
      })
    }

    // Default sorting: latest first
    return list.sort((a, b) => {
      const dateA = a.taken_at || a.created_at
      const dateB = b.taken_at || b.created_at
      return dateB.localeCompare(dateA)
    })
  }, [media, activeTab, selectedTag, selectedYear, selectedAlbumId, query, aiSearchInput])

  // Authentication Handlers
  const handleLogin = (e?: React.FormEvent, accountToDirectLogin?: UserAccount) => {
    if (e) e.preventDefault()
    setAuthError('')
    setAuthSuccess('')

    let targetAccount = accountToDirectLogin

    if (!targetAccount) {
      const email = authLoginForm.email.trim().toLowerCase()
      const password = authLoginForm.password.trim()

      if (!email || !password) {
        setAuthError('Vui lòng nhập đầy đủ Email và Mật khẩu.')
        return
      }

      const accounts = getAllRegisteredAccounts()
      const found = accounts.find(a => a.email.toLowerCase() === email)

      if (!found) {
        setAuthError('Tài khoản không tồn tại trên thiết bị này. Vui lòng kiểm tra lại hoặc Đăng ký tài khoản mới.')
        return
      }

      if (found.passwordHash !== password) {
        setAuthError('Mật khẩu không chính xác.')
        return
      }
      targetAccount = found
    }

    setPersistedCurrentUser(targetAccount, rememberDeviceOption)
    setCurrentUser(targetAccount)
    setAuthLoginForm({ email: '', password: '' })
    setShowAuthModal(false)
    showToast(`Đăng nhập thành công! Chào mừng ${targetAccount.name}.`)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthSuccess('')

    const name = authRegisterForm.name.trim()
    const email = authRegisterForm.email.trim().toLowerCase()
    const password = authRegisterForm.password.trim()
    const confirm = authRegisterForm.confirmPassword.trim()

    if (!name || !email || !password) {
      setAuthError('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }

    if (!email.includes('@')) {
      setAuthError('Địa chỉ email không hợp lệ.')
      return
    }

    if (password.length < 6) {
      setAuthError('Mật khẩu cần tối thiểu 6 ký tự.')
      return
    }

    if (password !== confirm) {
      setAuthError('Mật khẩu xác nhận không khớp.')
      return
    }

    const accounts = getAllRegisteredAccounts()
    if (accounts.some(a => a.email.toLowerCase() === email)) {
      setAuthError('Email này đã được đăng ký trên thiết bị này. Vui lòng đăng nhập.')
      return
    }

    const newAccount: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      name,
      passwordHash: password,
      createdAt: new Date().toISOString()
    }

    const updated = [...accounts, newAccount]
    saveAllRegisteredAccounts(updated)
    setPersistedCurrentUser(newAccount, rememberDeviceOption)
    setCurrentUser(newAccount)
    setAuthRegisterForm({ name: '', email: '', password: '', confirmPassword: '' })
    setShowAuthModal(false)
    showToast(`Đăng ký tài khoản thành công! Không gian kỷ niệm của bạn đã sẵn sàng.`)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setAuthError('')
    setAuthSuccess('')

    const { oldPassword, newPassword, confirmPassword } = authPasswordForm

    if (!oldPassword || !newPassword) {
      setAuthError('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.')
      return
    }

    if (currentUser.passwordHash && currentUser.passwordHash !== oldPassword) {
      setAuthError('Mật khẩu hiện tại không đúng.')
      return
    }

    if (newPassword.length < 6) {
      setAuthError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      setAuthError('Mật khẩu mới và xác nhận không khớp nhau.')
      return
    }

    const accounts = getAllRegisteredAccounts()
    const updatedAccounts = accounts.map(a => {
      if (a.id === currentUser.id) {
        return { ...a, passwordHash: newPassword }
      }
      return a
    })

    saveAllRegisteredAccounts(updatedAccounts)
    const updatedUser = { ...currentUser, passwordHash: newPassword }
    setPersistedCurrentUser(updatedUser, rememberDeviceOption)
    setCurrentUser(updatedUser)
    setAuthPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setAuthSuccess('Đổi mật khẩu thành công!')
    showToast('Đã cập nhật mật khẩu mới thành công!')
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !authProfileForm.name.trim()) return

    const accounts = getAllRegisteredAccounts()
    const updatedAccounts = accounts.map(a => {
      if (a.id === currentUser.id) {
        return { ...a, name: authProfileForm.name.trim() }
      }
      return a
    })

    saveAllRegisteredAccounts(updatedAccounts)
    const updatedUser = { ...currentUser, name: authProfileForm.name.trim() }
    setPersistedCurrentUser(updatedUser, rememberDeviceOption)
    setCurrentUser(updatedUser)
    setShowAuthModal(false)
    showToast('Đã cập nhật tên hiển thị thành công!')
  }

  const handleLogout = () => {
    // Reset browser tab title immediately
    document.title = 'Memories - Tìm kỷ niệm nhanh'

    // Thoroughly remove session from both storage stores
    setPersistedCurrentUser(null)
    setCurrentUser(null)

    // Clear all in-memory items and UI states
    setMedia([])
    setAlbums([])
    setIsLoaded(false)
    setShowAuthModal(false)
    setShowAddModal(false)
    setShowAddAlbumModal(false)
    setDetailMemory(null)
    setSlideshowActive(false)
    setEditingAlbum(null)
    setEditingMemory(null)
    setQuery('')
    setAiSearchInput('')
    setSelectedTag(null)
    setSelectedYear(null)
    setSelectedAlbumId(null)
    setActiveTab('home')
    setAuthError('')
    setAuthSuccess('')
    setAuthLoginForm({ email: '', password: '' })
    setAuthPortalTab('login')

    showToast('Đã đăng xuất thành công! Bạn đã thoát khỏi tài khoản.')
  }

  // Handle URL Validation & Testing
  const handleTestUrl = async (rawTextOverride?: string) => {
    const raw = (typeof rawTextOverride === 'string' ? rawTextOverride : urlInputText).trim()
    const firstUrl = raw.split(/[\n,;]/)[0]?.trim()
    if (!firstUrl || (!firstUrl.startsWith('http://') && !firstUrl.startsWith('https://') && !firstUrl.startsWith('data:'))) {
      setUrlPreviewStatus('idle')
      setUrlDetectedSource('')
      return
    }

    let normalized = normalizeImageUrl(firstUrl)
    setUrlPreviewStatus('loading')

    // If it's a Google Photos web page URL, try resolving
    if (isGooglePhotosWebPage(normalized)) {
      const resolved = await tryResolveGooglePhotosDirectLink(normalized)
      if (resolved) {
        normalized = resolved
        if (!raw.includes('\n') && !raw.includes(',')) {
          setUrlInputText(resolved)
        }
      }
    }

    // Detect Source
    let detected = 'Liên kết ảnh Web'
    if (normalized.includes('googleusercontent.com') || normalized.includes('photos.fife') || isGooglePhotosWebPage(firstUrl)) {
      detected = 'Google Photos'
    } else if (normalized.includes('drive.google.com')) {
      detected = 'Google Drive'
    } else if (normalized.includes('unsplash.com')) {
      detected = 'Unsplash'
    } else if (normalized.includes('imgur.com')) {
      detected = 'Imgur'
    } else if (normalized.includes('dropbox.com')) {
      detected = 'Dropbox'
    } else if (normalized.includes('postimg.cc')) {
      detected = 'Postimages'
    }
    setUrlDetectedSource(detected)

    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      setUrlPreviewStatus('valid')
      // Auto extract title if empty
      if (!urlForm.title) {
        try {
          const pathname = new URL(normalized).pathname
          const filename = pathname.split('/').pop()?.split('.')[0] || 'Kỷ niệm từ URL'
          if (filename && filename.length > 2 && !filename.includes('photo-') && !filename.includes('image')) {
            setUrlForm(prev => ({
              ...prev,
              title: decodeURIComponent(filename).replace(/[-_]/g, ' ')
            }))
          }
        } catch {
          // ignore
        }
      }
    }

    img.onerror = () => {
      // Test with proxy fallback
      const proxyImg = new Image()
      proxyImg.referrerPolicy = 'no-referrer'
      proxyImg.crossOrigin = 'anonymous'
      proxyImg.onload = () => {
        setUrlPreviewStatus('valid')
      }
      proxyImg.onerror = () => {
        setUrlPreviewStatus(isGooglePhotosWebPage(firstUrl) ? 'error' : 'valid')
      }
      proxyImg.src = getSafeProxyImageUrl(normalized)
    }

    img.src = normalized
  }

  // Auto Resolve Google Photos direct link
  const handleAutoResolveGooglePhotos = async () => {
    const raw = urlInputText.trim()
    if (!raw) return
    const firstUrl = raw.split(/[\n,;]/)[0]?.trim()
    showToast('Đang quét và giải mã link ảnh từ Google Photos...')
    setUrlPreviewStatus('loading')
    try {
      const resolved = await tryResolveGooglePhotosDirectLink(firstUrl)
      if (resolved) {
        setUrlInputText(resolved)
        setUrlPreviewStatus('valid')
        showToast('🎉 Đã giải mã thành công link ảnh trực tiếp!')
      } else {
        setUrlPreviewStatus('error')
        showToast('Ảnh ở chế độ riêng tư: Hãy chuột phải vào ảnh trên Google Photos > Chọn "Sao chép địa chỉ hình ảnh" và dán lại.')
      }
    } catch {
      setUrlPreviewStatus('error')
      showToast('Không thể giải mã tự động. Vui lòng copy link ảnh trực tiếp.')
    }
  }

  // Debounced auto-test on urlInputText change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (urlInputText.trim()) {
        handleTestUrl()
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [urlInputText])

  // Paste from clipboard helper
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text) {
          setUrlInputText(prev => prev ? `${prev}\n${text.trim()}` : text.trim())
          showToast('Đã dán liên kết từ clipboard!')
        }
      }
    } catch {
      showToast('Hãy dùng Ctrl+V để dán trực tiếp vào khung nhập.')
    }
  }

  // Auto Tag Extraction helper
  const handleAutoExtractUrlMeta = () => {
    const url = urlInputText.trim()
    if (!url) return
    try {
      const firstUrl = url.split(/[\n,;]/)[0]?.trim()
      const normalized = normalizeImageUrl(firstUrl)
      const urlObj = new URL(normalized)
      const parts = urlObj.pathname.split('/').filter(Boolean)
      const tags: string[] = []
      if (normalized.includes('googleusercontent') || normalized.includes('photos')) tags.push('google photos')
      if (normalized.includes('drive.google')) tags.push('google drive')
      if (normalized.includes('unsplash')) tags.push('nhiếp ảnh', 'unsplash')
      if (normalized.includes('imgur')) tags.push('album', 'imgur')
      if (normalized.includes('dropbox')) tags.push('dropbox')

      parts.forEach(p => {
        if (p.length > 3 && isNaN(Number(p)) && !p.startsWith('pw') && !p.startsWith('photo-')) {
          tags.push(decodeURIComponent(p).replace(/[-_]/g, ' '))
        }
      })
      setUrlForm(prev => ({
        ...prev,
        tags: Array.from(new Set([...(prev.tags ? prev.tags.split(',') : []), ...tags])).join(', ')
      }))
      showToast('Đã tạo gợi ý thẻ từ liên kết ảnh!')
    } catch {
      showToast('Đã phân tích liên kết.')
    }
  }

  // File Upload Handlers (with EXIF extraction)
  const processSelectedFiles = async (files: FileList | File[]) => {
    setIsUploading(true)
    const newUploads: { url: string; file_name: string; exif?: ExifInfo | null }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      let exifInfo: ExifInfo | null = null
      if (parseExifOption) {
        try {
          exifInfo = await extractExifFromFile(file)
        } catch (e) {
          console.warn('Lỗi đọc EXIF:', e)
        }
      }

      try {
        const compressedBase64 = await compressImageFile(file, 1800, 0.88)
        newUploads.push({
          url: compressedBase64,
          file_name: file.name,
          exif: exifInfo
        })
      } catch (err) {
        console.error('Lỗi nén ảnh:', err)
      }
    }

    setUploadedFiles(prev => [...prev, ...newUploads])
    setIsUploading(false)

    // Auto-fill metadata if single file with EXIF
    if (newUploads.length === 1 && newUploads[0].exif) {
      const exif = newUploads[0].exif
      if (exif.dateTimeOriginal && !urlForm.taken_at) {
        setUrlForm(prev => ({ ...prev, taken_at: exif.dateTimeOriginal || prev.taken_at }))
      }
      if (exif.latitude && exif.longitude && !urlForm.location) {
        setUrlForm(prev => ({
          ...prev,
          location: `GPS: ${exif.latitude?.toFixed(4)}, ${exif.longitude?.toFixed(4)}`
        }))
      }
    }

    if (newUploads.length > 0) {
      showToast(`Đã chuẩn bị ${newUploads.length} bức ảnh!`)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files)
    }
  }

  // Save new memory
  const handleSaveMemory = async () => {
    if (!currentUser) return
    const finalItems: MediaItem[] = []
    const now = new Date().toISOString()
    const rawTags = urlForm.tags.split(/[,#]/).map(t => t.trim()).filter(Boolean)

    if (uploadMode === 'device') {
      if (uploadedFiles.length === 0) {
        alert('Vui lòng chọn hoặc kéo thả ít nhất một hình ảnh từ máy!')
        return
      }

      uploadedFiles.forEach((fileObj, idx) => {
        const itemTitle = urlForm.title
          ? (uploadedFiles.length > 1 ? `${urlForm.title} (${idx + 1})` : urlForm.title)
          : fileObj.file_name.replace(/\.[^/.]+$/, '')

        finalItems.push({
          id: `mem_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          file_name: fileObj.file_name,
          mime_type: 'image/jpeg',
          source: 'upload',
          storage_key: fileObj.url,
          title: itemTitle,
          description: urlForm.description || null,
          taken_at: urlForm.taken_at || now.slice(0, 10),
          ai_tags: rawTags.length > 0 ? rawTags : ['kỷ niệm'],
          album_id: urlForm.album_id || null,
          location: urlForm.location || null,
          created_at: now,
          user_id: currentUser.id,
          exif_data: fileObj.exif || null
        })
      })
    } else {
      // URL mode (supports single link or multiple links separated by newline / comma / semicolon)
      const rawUrls = urlInputText
        .split(/[\n,;]/)
        .map(u => u.trim())
        .filter(u => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:'))

      if (rawUrls.length === 0) {
        alert('Vui lòng nhập ít nhất một đường dẫn hình ảnh hợp lệ (bắt đầu bằng http:// hoặc https://)!')
        return
      }

      setIsUploading(true)
      showToast(`Đang xử lý ${rawUrls.length} bức ảnh từ URL...`)

      for (let idx = 0; idx < rawUrls.length; idx++) {
        const rawLink = rawUrls[idx]
        let normalized = normalizeImageUrl(rawLink)
        if (isGooglePhotosWebPage(normalized)) {
          const resolved = await tryResolveGooglePhotosDirectLink(normalized)
          if (resolved) {
            normalized = resolved
          }
        }
        let finalStorageKey = normalized
        let extractedExif: ExifInfo | null = null

        // Offline storage conversion if option is checked
        if (urlOfflineSaveOption && !normalized.startsWith('data:')) {
          try {
            const fetched = await fetchImageAsBase64(normalized)
            if (fetched && fetched.dataUrl) {
              finalStorageKey = fetched.dataUrl
              if (fetched.exif) extractedExif = fetched.exif
            }
          } catch (fetchErr: any) {
            console.warn('Cannot convert URL to local Base64, saving direct normalized URL:', fetchErr)
            finalStorageKey = normalized
          }
        }

        let defaultTitle = `Ảnh URL ${idx + 1}`
        try {
          const pathname = new URL(normalized).pathname
          const fn = pathname.split('/').pop()?.split('.')[0]
          if (fn && fn.length > 2 && !fn.includes('photo-') && !fn.includes('image')) {
            defaultTitle = decodeURIComponent(fn).replace(/[-_]/g, ' ')
          }
        } catch {}

        const itemTitle = urlForm.title
          ? (rawUrls.length > 1 ? `${urlForm.title} (${idx + 1})` : urlForm.title)
          : defaultTitle

        finalItems.push({
          id: `mem_url_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          file_name: `url_photo_${idx + 1}.jpg`,
          mime_type: 'image/jpeg',
          source: 'external_url',
          storage_key: finalStorageKey,
          title: itemTitle,
          description: urlForm.description || null,
          taken_at: (extractedExif?.dateTimeOriginal) || urlForm.taken_at || now.slice(0, 10),
          ai_tags: rawTags.length > 0 ? rawTags : ['link ảnh', (urlDetectedSource || 'kỷ niệm').toLowerCase()],
          album_id: urlForm.album_id || null,
          location: (extractedExif?.latitude && extractedExif?.longitude)
            ? `GPS: ${extractedExif.latitude.toFixed(4)}, ${extractedExif.longitude.toFixed(4)}`
            : (urlForm.location || null),
          created_at: now,
          user_id: currentUser.id,
          exif_data: extractedExif || null
        })
      }
      setIsUploading(false)
    }

    setMedia(prev => [...finalItems, ...prev])
    setShowAddModal(false)
    setUploadedFiles([])
    setUrlInputText('')
    setUrlPreviewStatus('idle')
    setUrlDetectedSource('')
    setUrlForm({
      title: '',
      description: '',
      location: '',
      taken_at: new Date().toISOString().slice(0, 10),
      tags: '',
      album_id: ''
    })
    showToast(`Đã lưu thành công ${finalItems.length} kỷ niệm vào tài khoản của bạn!`)
  }

  // Toggle Favorite
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMedia(prev =>
      prev.map(m => {
        if (m.id === id) {
          const updated = !m.is_favorite
          showToast(updated ? 'Đã thêm vào mục Yêu thích ❤️' : 'Đã bỏ khỏi Yêu thích')
          return { ...m, is_favorite: updated }
        }
        return m
      })
    )
    if (detailMemory?.id === id) {
      setDetailMemory(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null)
    }
  }

  // Delete Memory
  const handleDeleteMemory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentUser) return
    if (window.confirm('Bạn có chắc chắn muốn xóa bức ảnh kỷ niệm này?')) {
      deleteMediaItemFromDB(id, currentUser.id)
      setMedia(prev => prev.filter(m => m.id !== id))
      if (detailMemory?.id === id) setDetailMemory(null)
      showToast('Đã xóa bức ảnh khỏi bộ sưu tập.')
    }
  }

  // Save Edit Memory
  const handleSaveEditedMemory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMemory) return

    setMedia(prev =>
      prev.map(m => (m.id === editingMemory.id ? editingMemory : m))
    )
    if (detailMemory?.id === editingMemory.id) {
      setDetailMemory(editingMemory)
    }
    setEditingMemory(null)
    showToast('Đã cập nhật thông tin kỷ niệm!')
  }

  // Create Album
  const handleSaveAlbum = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !albumForm.name.trim()) return

    if (editingAlbum) {
      setAlbums(prev =>
        prev.map(a =>
          a.id === editingAlbum.id
            ? { ...a, name: albumForm.name.trim(), description: albumForm.description.trim() }
            : a
        )
      )
      setEditingAlbum(null)
      showToast('Đã cập nhật album!')
    } else {
      const newAlbum: AlbumItem = {
        id: `alb_${Date.now()}`,
        name: albumForm.name.trim(),
        description: albumForm.description.trim() || null,
        cover_media_id: null,
        created_at: new Date().toISOString(),
        user_id: currentUser.id
      }
      setAlbums(prev => [newAlbum, ...prev])
      showToast(`Đã tạo album "${newAlbum.name}"!`)
    }
    setShowAddAlbumModal(false)
    setAlbumForm({ name: '', description: '' })
  }

  // Delete Album
  const handleDeleteAlbum = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentUser) return
    if (window.confirm('Bạn có chắc muốn xóa album này? (Các bức ảnh bên trong vẫn sẽ được giữ lại)')) {
      deleteAlbumFromDB(id, currentUser.id)
      setAlbums(prev => prev.filter(a => a.id !== id))
      setMedia(prev => prev.map(m => m.album_id === id ? { ...m, album_id: null } : m))
      if (selectedAlbumId === id) setSelectedAlbumId(null)
      showToast('Đã xóa album.')
    }
  }

  // Lightbox Navigation
  const handlePrevDetail = () => {
    if (!detailMemory) return
    const currentIndex = filteredMedia.findIndex(m => m.id === detailMemory.id)
    if (currentIndex > 0) {
      setDetailMemory(filteredMedia[currentIndex - 1])
    } else {
      setDetailMemory(filteredMedia[filteredMedia.length - 1])
    }
  }

  const handleNextDetail = () => {
    if (!detailMemory) return
    const currentIndex = filteredMedia.findIndex(m => m.id === detailMemory.id)
    if (currentIndex >= 0 && currentIndex < filteredMedia.length - 1) {
      setDetailMemory(filteredMedia[currentIndex + 1])
    } else {
      setDetailMemory(filteredMedia[0])
    }
  }

  // Download image file
  const handleDownloadImage = (item: MediaItem) => {
    const link = document.createElement('a')
    link.href = item.storage_key
    link.download = item.file_name || `${item.title || 'memory'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Đang tải hình ảnh xuống...')
  }

  // Export JSON Backup for Account
  const handleExportBackup = () => {
    if (!currentUser) return
    const data = {
      version: 2,
      export_date: new Date().toISOString(),
      account: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name
      },
      memories: media,
      albums: albums
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MyMemories_${currentUser.name.replace(/\s+/g, '_')}_Backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Đã xuất tệp sao lưu an toàn về máy tính của bạn!')
  }

  // Import JSON Backup for Account
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return
    const file = e.target.files?.[0]
    if (!file) return

    const activeUserId = currentUser.id
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const raw = evt.target?.result as string
        const parsed = JSON.parse(raw)
        if (parsed.memories && Array.isArray(parsed.memories)) {
          const importedMedia: MediaItem[] = parsed.memories.map((m: any) => ({
            ...m,
            user_id: activeUserId
          }))
          const importedAlbums: AlbumItem[] = (parsed.albums || []).map((a: any) => ({
            ...a,
            user_id: activeUserId
          }))

          setMedia(importedMedia)
          setAlbums(importedAlbums)
          await saveAllMediaToDB(importedMedia, activeUserId)
          await saveAllAlbumsToDB(importedAlbums, activeUserId)
          showToast(`Đã khôi phục thành công ${importedMedia.length} ảnh và ${importedAlbums.length} album!`)
        } else {
          alert('Tệp sao lưu không đúng định dạng My Memories!')
        }
      } catch (err) {
        alert('Không thể đọc tệp sao lưu. Vui lòng kiểm tra lại tệp .json')
      }
    }
    reader.readAsText(file)
  }

  // Clear Account Data
  const handleClearAccountData = async () => {
    if (!currentUser) return
    if (window.confirm(`Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu ảnh và album của tài khoản ${currentUser.name}? Thao tác này không thể hoàn tác.`)) {
      await clearAccountDatabase(currentUser.id)
      setMedia([])
      setAlbums([])
      showToast('Đã xóa sạch toàn bộ kỷ niệm của tài khoản.')
    }
  }

  // Supabase Testing & Sync Handlers
  const handleTestSupabase = async () => {
    if (!currentUser) return
    setSupabaseTesting(true)
    setSupabaseStatus({ text: 'Đang kiểm tra kết nối tới Supabase...', type: '' })
    const result = await testSupabaseConnection(supabaseForm.url, supabaseForm.anonKey)
    setSupabaseTesting(false)
    if (result.success) {
      setSupabaseStatus({ text: result.message, type: 'success' })
      // Save configuration to current account
      const updatedUser: UserAccount = {
        ...currentUser,
        supabaseConfig: {
          url: supabaseForm.url,
          anonKey: supabaseForm.anonKey,
          syncEnabled: supabaseForm.syncEnabled
        }
      }
      setCurrentUser(updatedUser)
      const accounts = getAllRegisteredAccounts().map(a => a.id === currentUser.id ? updatedUser : a)
      saveAllRegisteredAccounts(accounts)
      showToast('Đã lưu cấu hình Supabase cho tài khoản!')
    } else {
      setSupabaseStatus({ text: result.message, type: 'error' })
    }
  }

  const handleSyncToSupabase = async () => {
    if (!currentUser) return
    if (!supabaseForm.url || !supabaseForm.anonKey) {
      alert('Vui lòng nhập Supabase Project URL và Anon Key trước khi đồng bộ!')
      return
    }
    setSupabaseSyncing(true)
    try {
      const client = createSupabaseInstance(supabaseForm.url, supabaseForm.anonKey)
      if (!client) throw new Error('Không thể khởi tạo client Supabase')

      // Sync memories
      for (const item of media) {
        await client.from('memories').upsert({
          id: item.id,
          user_id: currentUser.id,
          title: item.title,
          description: item.description,
          taken_at: item.taken_at,
          location: item.location,
          ai_tags: item.ai_tags,
          is_favorite: item.is_favorite,
          album_id: item.album_id,
          storage_key: item.storage_key,
          exif_data: item.exif_data,
          created_at: item.created_at
        })
      }

      // Sync albums
      for (const alb of albums) {
        await client.from('albums').upsert({
          id: alb.id,
          user_id: currentUser.id,
          name: alb.name,
          description: alb.description,
          created_at: alb.created_at
        })
      }

      showToast(`Đã đồng bộ thành công ${media.length} ảnh và ${albums.length} album lên Supabase!`)
    } catch (err: any) {
      alert(`Lỗi khi đồng bộ lên Supabase: ${err.message || err}`)
    } finally {
      setSupabaseSyncing(false)
    }
  }

  const handlePullFromSupabase = async () => {
    if (!currentUser) return
    if (!supabaseForm.url || !supabaseForm.anonKey) {
      alert('Vui lòng nhập Supabase Project URL và Anon Key!')
      return
    }
    const activeUserId = currentUser.id
    setSupabaseSyncing(true)
    try {
      const client = createSupabaseInstance(supabaseForm.url, supabaseForm.anonKey)
      if (!client) throw new Error('Không thể khởi tạo client')

      const { data: remoteMedia, error: mErr } = await client
        .from('memories')
        .select('*')
        .eq('user_id', activeUserId)

      const { data: remoteAlbums, error: aErr } = await client
        .from('albums')
        .select('*')
        .eq('user_id', activeUserId)

      if (mErr) throw mErr
      if (aErr) throw aErr

      if (remoteMedia) {
        setMedia(remoteMedia)
        await saveAllMediaToDB(remoteMedia, activeUserId)
      }
      if (remoteAlbums) {
        setAlbums(remoteAlbums)
        await saveAllAlbumsToDB(remoteAlbums, activeUserId)
      }

      showToast(`Đã tải về ${(remoteMedia || []).length} ảnh từ Supabase!`)
    } catch (err: any) {
      alert(`Lỗi khi tải dữ liệu từ Supabase: ${err.message || err}`)
    } finally {
      setSupabaseSyncing(false)
    }
  }

  // =========================================================================
  // RENDER AUTH PORTAL (When no user is logged in on this device/browser)
  // =========================================================================
  if (!currentUser) {
    const localAccounts = getAllRegisteredAccounts()

    return (
      <div className="auth-portal-screen">
        <div className="auth-portal-container">
          {/* Left Brand Showcase */}
          <div className="auth-portal-sidebar">
            <div>
              <div className="auth-portal-brand">
                <div className="brand-mark" style={{ background: 'rgba(255,255,255,0.12)', color: '#e5be8a' }}>
                  <Sparkles size={22} />
                </div>
                <h1>MEMORIES</h1>
              </div>
              <p className="auth-portal-tagline">
                Không gian lưu giữ khoảnh khắc & tìm kiếm kỷ niệm thông minh, an toàn và riêng tư.
              </p>

              <div className="auth-features-list">
                <div className="auth-feature-item">
                  <div className="auth-feature-icon">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <strong>Độc lập trên từng thiết bị & IP</strong>
                    <p>Phiên làm việc riêng biệt cho từng máy, không bị tự động chia sẻ hay can thiệp.</p>
                  </div>
                </div>

                <div className="auth-feature-item">
                  <div className="auth-feature-icon">
                    <Database size={16} />
                  </div>
                  <div>
                    <strong>Database riêng biệt theo tài khoản</strong>
                    <p>Mỗi tài khoản lưu trữ trên phân vùng cơ sở dữ liệu IndexedDB riêng không trùng lặp.</p>
                  </div>
                </div>

                <div className="auth-feature-item">
                  <div className="auth-feature-icon">
                    <Camera size={16} />
                  </div>
                  <div>
                    <strong>Trích xuất thông số ảnh EXIF</strong>
                    <p>Tự động nhận diện ngày chụp, địa điểm GPS và dòng máy ảnh khi tải ảnh từ máy hoặc URL.</p>
                  </div>
                </div>

                <div className="auth-feature-item">
                  <div className="auth-feature-icon">
                    <Upload size={16} />
                  </div>
                  <div>
                    <strong>Hỗ trợ kết nối Supabase Cloud</strong>
                    <p>Đồng bộ dữ liệu đa thiết bị an toàn khi người dùng cấu hình.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-device-note">
              🔒 <strong>Bảo mật thiết bị:</strong> Bạn đang truy cập trên thiết bị này. Đăng nhập để mở không gian kỷ niệm cá nhân của bạn.
            </div>
          </div>

          {/* Right Auth Action Panel */}
          <div className="auth-portal-main">
            {/* Tab Pill Switcher */}
            <div className="auth-portal-tabs">
              <button
                className={`auth-portal-tab ${authPortalTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthPortalTab('login')
                  setAuthError('')
                  setAuthSuccess('')
                }}
              >
                <UserCheck size={16} />
                <span>Đăng nhập</span>
              </button>
              <button
                className={`auth-portal-tab ${authPortalTab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setAuthPortalTab('register')
                  setAuthError('')
                  setAuthSuccess('')
                }}
              >
                <UserPlus size={16} />
                <span>Đăng ký mới</span>
              </button>
            </div>

            {/* Quick account selection if accounts exist on this device */}
            {localAccounts.length > 0 && authPortalTab === 'login' && (
              <div className="auth-quick-accounts-box">
                <div className="auth-quick-accounts-title">
                  <Check size={14} color="#7c6f5e" />
                  <span>Tài khoản sẵn có trên thiết bị này:</span>
                </div>
                <div className="auth-quick-account-chips">
                  {localAccounts.map(acc => (
                    <div
                      key={acc.id}
                      className="auth-account-chip"
                      onClick={() => {
                        setAuthLoginForm({ email: acc.email, password: acc.passwordHash || '123456' })
                        handleLogin(undefined, acc)
                      }}
                      title={`Đăng nhập nhanh với tài khoản ${acc.name}`}
                    >
                      <div className="auth-account-chip-avatar">
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{acc.name} ({acc.email})</span>
                      <ChevronRight size={13} color="#999" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {authError && <div className="alert-box alert-error">{authError}</div>}
            {authSuccess && <div className="alert-box alert-success">{authSuccess}</div>}

            {/* LOGIN FORM */}
            {authPortalTab === 'login' && (
              <form className="modal-form" onSubmit={(e) => handleLogin(e)}>
                <label>
                  Địa chỉ Email:
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={authLoginForm.email}
                    onChange={e => setAuthLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    autoFocus
                  />
                </label>
                <label>
                  Mật khẩu:
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authLoginForm.password}
                    onChange={e => setAuthLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </label>

                <div style={{ margin: '6px 0 14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#555' }}>
                    <input
                      type="checkbox"
                      checked={rememberDeviceOption}
                      onChange={e => setRememberDeviceOption(e.target.checked)}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                  </label>
                </div>

                <button className="primary full" type="submit" style={{ marginTop: 4 }}>
                  <UserCheck size={16} />
                  <span>Đăng nhập vào Memories</span>
                </button>

                <div style={{ marginTop: 16, fontSize: 12.5, color: '#777', textAlign: 'center' }}>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    className="text-button"
                    style={{ position: 'static', padding: 0, fontWeight: 600 }}
                    onClick={() => {
                      setAuthPortalTab('register')
                      setAuthError('')
                      setAuthSuccess('')
                    }}
                  >
                    Đăng ký tài khoản mới ngay
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {authPortalTab === 'register' && (
              <form className="modal-form" onSubmit={handleRegister}>
                <label>
                  Tên của bạn (Hiển thị trên tiêu đề Memories):
                  <input
                    type="text"
                    placeholder="VD: Thanh Yến, Tuấn Anh..."
                    value={authRegisterForm.name}
                    onChange={e => setAuthRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    autoFocus
                  />
                </label>
                <label>
                  Địa chỉ Email (Dùng để đăng nhập):
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={authRegisterForm.email}
                    onChange={e => setAuthRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </label>
                <div className="form-row">
                  <label>
                    Mật khẩu:
                    <input
                      type="password"
                      placeholder="Ít nhất 6 ký tự"
                      value={authRegisterForm.password}
                      onChange={e => setAuthRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Xác nhận mật khẩu:
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={authRegisterForm.confirmPassword}
                      onChange={e => setAuthRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </label>
                </div>

                <div style={{ margin: '6px 0 14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#555' }}>
                    <input
                      type="checkbox"
                      checked={rememberDeviceOption}
                      onChange={e => setRememberDeviceOption(e.target.checked)}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                  </label>
                </div>

                <button className="primary full" type="submit" style={{ marginTop: 4 }}>
                  <UserPlus size={16} />
                  <span>Tạo tài khoản & Mở database riêng</span>
                </button>

                <div style={{ marginTop: 16, fontSize: 12.5, color: '#777', textAlign: 'center' }}>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    className="text-button"
                    style={{ position: 'static', padding: 0, fontWeight: 600 }}
                    onClick={() => {
                      setAuthPortalTab('login')
                      setAuthError('')
                      setAuthSuccess('')
                    }}
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Toast Notification in Portal */}
        {notice && (
          <div className="toast" onClick={() => setNotice('')}>
            <span>{notice}</span>
            <X size={14} />
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // MAIN AUTHENTICATED APP SHELL
  // =========================================================================
  return (
    <div className="app-shell">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Left Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>
          <div className="brand-text">
            <span>MEMORIES</span>
            <small>{currentUser.name} - Lưu giữ ký ức</small>
          </div>
        </div>

        <nav>
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); setSelectedTag(null); setSelectedYear(null); setSelectedAlbumId(null); setMobileMenuOpen(false); }}
          >
            <Home size={18} />
            <span>Trang chủ</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => { setActiveTab('media'); setSelectedAlbumId(null); setMobileMenuOpen(false); }}
          >
            <ImageIcon size={18} />
            <span>Tất cả kỷ niệm</span>
            <span className="badge">{media.length}</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => { setActiveTab('albums'); setSelectedTag(null); setSelectedYear(null); setMobileMenuOpen(false); }}
          >
            <FolderOpen size={18} />
            <span>Bộ sưu tập Album</span>
            <span className="badge">{albums.length}</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => { setActiveTab('favorites'); setSelectedAlbumId(null); setMobileMenuOpen(false); }}
          >
            <Heart size={18} />
            <span>Yêu thích</span>
            <span className="badge">{media.filter(m => m.is_favorite).length}</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => { setActiveTab('timeline'); setSelectedAlbumId(null); setMobileMenuOpen(false); }}
          >
            <RotateCcw size={18} />
            <span>Dòng thời gian</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ai'); setMobileMenuOpen(false); }}
          >
            <Sparkles size={18} />
            <span>Tìm kiếm AI</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
          >
            <Settings size={18} />
            <span>Cài đặt & Database</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="primary add-btn-sidebar"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Thêm kỷ niệm</span>
          </button>

          {/* User Account Card with Quick Switch / Auth */}
          <div
            className="user-profile-badge"
            onClick={() => {
              setShowAuthModal(true)
              setAuthModalTab('profile')
            }}
            title="Nhấn để đổi tên hoặc chuyển tài khoản"
          >
            <div className="avatar">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.email}</span>
            </div>
            <Edit2 size={14} className="edit-ico" />
          </div>

          <div className="account-auth-buttons">
            <button
              className="secondary"
              onClick={() => {
                setShowAuthModal(true)
                setAuthModalTab('switch_account')
              }}
              title="Đổi tài khoản khác"
            >
              <UserCheck size={14} />
              <span>Tài khoản</span>
            </button>
            <button
              className="secondary delete-btn"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>

          <div className="security-note">
            <Database size={15} />
            <span>Database riêng biệt theo tài khoản & không trùng lặp</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content">
        {/* Header */}
        <header>
          <div className="header-left">
            <button
              className="menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>
            <div className="header-title-box">
              <h1 className="app-page-title">{currentUser.name} - Memories Tìm kỷ niệm nhanh</h1>
              <div className="breadcrumbs">
                <strong>{currentUser.name}</strong>
                <span> / </span>
                <span className="crumb-page">
                  {activeTab === 'home' && 'Trang chủ'}
                  {activeTab === 'media' && 'Tất cả kỷ niệm'}
                  {activeTab === 'albums' && (selectedAlbumId ? `Album: ${albums.find(a => a.id === selectedAlbumId)?.name || 'Chi tiết'}` : 'Bộ sưu tập Album')}
                  {activeTab === 'favorites' && 'Ảnh yêu thích'}
                  {activeTab === 'timeline' && 'Dòng thời gian'}
                  {activeTab === 'ai' && 'Tìm kiếm AI'}
                  {activeTab === 'settings' && 'Cài đặt & Database'}
                </span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {/* Quick Search */}
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Tìm ảnh, địa điểm, thẻ, máy ảnh..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button className="clear-search" onClick={() => setQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              className="primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span className="btn-label">Thêm ảnh</span>
            </button>
          </div>
        </header>

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <section className="hero">
              <div className="hero-text">
                <p className="eyebrow">KHÔNG GIAN KỶ NIỆM RIÊNG TƯ CỦA {currentUser.name.toUpperCase()}</p>
                <h1>
                  Lưu giữ từng khoảnh khắc <em>quý giá</em> trong đời.
                </h1>
                <p className="hero-copy">
                  Mỗi tài khoản sở hữu một cơ sở dữ liệu riêng biệt không trùng lặp. Hỗ trợ tải ảnh chất lượng cao, trích xuất thông số máy ảnh EXIF, tìm kiếm thông minh và kết nối Supabase linh hoạt.
                </p>
                <div className="hero-cta-group">
                  <button className="primary" onClick={() => setShowAddModal(true)}>
                    <Upload size={16} />
                    <span>Tải ảnh từ máy tính / ĐT</span>
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      setUploadMode('url')
                      setShowAddModal(true)
                    }}
                  >
                    <LinkIcon size={16} />
                    <span>Thêm ảnh từ URL</span>
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setShowAddAlbumModal(true)}
                  >
                    <FolderPlus size={16} />
                    <span>Tạo Album mới</span>
                  </button>
                </div>
              </div>

              <div className="hero-art">
                {media.length > 0 ? (
                  <>
                    <div className="polaroid polaroid-back" onClick={() => setDetailMemory(media[0])}>
                      <SmartImage src={media[0]?.storage_key} alt="Memory" />
                      <span>{media[0]?.title || 'Kỷ niệm'}</span>
                    </div>
                    {media.length > 1 && (
                      <div className="polaroid polaroid-front" onClick={() => setDetailMemory(media[1])}>
                        <SmartImage src={media[1]?.storage_key} alt="Memory" />
                        <span>{media[1]?.title || 'Khoảnh khắc'}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="polaroid polaroid-front" style={{ transform: 'none', position: 'static' }}>
                    <div style={{ width: '100%', height: 140, background: '#eee', display: 'grid', placeItems: 'center', color: '#999', fontSize: 12 }}>
                      Chưa có ảnh nào
                    </div>
                    <span>Sẵn sàng lưu giữ</span>
                  </div>
                )}
              </div>
            </section>

            {/* On This Day (Ngày này năm xưa) */}
            {onThisDayMemories.length > 0 && (
              <section style={{ margin: '20px 0 32px' }}>
                <div className="section-head">
                  <h2>
                    <Sparkles size={20} style={{ color: '#e56d4c', marginRight: 8 }} />
                    Ngày này năm xưa
                  </h2>
                  <span className="count">{onThisDayMemories.length} khoảnh khắc</span>
                </div>
                <div className="memory-grid">
                  {onThisDayMemories.map(item => (
                    <div
                      key={item.id}
                      className="memory-card"
                      onClick={() => setDetailMemory(item)}
                    >
                      <div className="memory-image">
                        <SmartImage src={item.storage_key} alt={item.title || 'Memory'} loading="lazy" />
                        <button
                          className={`favorite ${item.is_favorite ? 'active' : ''}`}
                          onClick={(e) => toggleFavorite(item.id, e)}
                        >
                          <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                        {item.location && (
                          <div className="photo-location-pill">📍 {item.location}</div>
                        )}
                        {item.exif_data?.model && (
                          <div className="photo-exif-badge">📷 {item.exif_data.model}</div>
                        )}
                      </div>
                      <div className="memory-info">
                        <div>
                          <h3>{item.title || 'Không có tiêu đề'}</h3>
                          <p>{item.taken_at || item.created_at?.slice(0, 10)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Filter tags & years bar */}
            {(allTags.length > 0 || allYears.length > 0) && (
              <div className="filter-scroll-container">
                <div className="tag-bar">
                  <button
                    className={`tag-chip ${!selectedTag && !selectedYear ? 'active' : ''}`}
                    onClick={() => { setSelectedTag(null); setSelectedYear(null); }}
                  >
                    Tất cả
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                  {allYears.map(year => (
                    <button
                      key={year}
                      className={`tag-chip year-chip ${selectedYear === year ? 'active' : ''}`}
                      onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                    >
                      Năm {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Memories Section */}
            <section>
              <div className="section-head">
                <h2>Kỷ niệm gần đây</h2>
                <span className="count">{filteredMedia.length} bức ảnh</span>
              </div>

              {filteredMedia.length === 0 ? (
                <div className="empty">
                  <Camera size={48} className="empty-icon" />
                  <h3>Chưa có bức ảnh nào trong tài khoản của bạn</h3>
                  <p>
                    Hãy bắt đầu tạo cuốn nhật ký ảnh của riêng bạn bằng cách tải ảnh lên từ thiết bị hoặc dán đường dẫn ảnh URL trực tuyến.
                  </p>
                  <div className="empty-actions">
                    <button className="primary" onClick={() => { setUploadMode('device'); setShowAddModal(true); }}>
                      <Upload size={16} />
                      <span>Tải ảnh từ máy</span>
                    </button>
                    <button className="secondary" onClick={() => { setUploadMode('url'); setShowAddModal(true); }}>
                      <LinkIcon size={16} />
                      <span>Dán link ảnh URL</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="memory-grid">
                  {filteredMedia.map(item => (
                    <div
                      key={item.id}
                      className="memory-card"
                      onClick={() => setDetailMemory(item)}
                    >
                      <div className="memory-image">
                        <SmartImage src={item.storage_key} alt={item.title || 'Memory'} loading="lazy" />
                        <button
                          className={`favorite ${item.is_favorite ? 'active' : ''}`}
                          onClick={(e) => toggleFavorite(item.id, e)}
                        >
                          <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                        {item.location && (
                          <div className="photo-location-pill">📍 {item.location}</div>
                        )}
                        {item.exif_data?.model && (
                          <div className="photo-exif-badge">📷 {item.exif_data.model}</div>
                        )}
                      </div>
                      <div className="memory-info">
                        <div>
                          <h3>{item.title || 'Không có tiêu đề'}</h3>
                          <p>{item.taken_at || item.created_at?.slice(0, 10)}</p>
                        </div>
                        {item.album_id && (
                          <span className="album-indicator" title="Thuộc album">📁</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Bottom Insight Panels */}
            <section className="bottom-panels">
              <div className="panel">
                <div className="panel-icon">
                  <FolderOpen size={20} />
                </div>
                <div>
                  <p className="eyebrow">BỘ SƯU TẬP</p>
                  <h3>{albums.length} Album chủ đề</h3>
                  <p>Tổ chức và phân loại các chuyến đi, họp mặt bạn bè, gia đình vào từng album riêng biệt.</p>
                  <button className="text-button" onClick={() => setActiveTab('albums')}>
                    Xem tất cả album →
                  </button>
                </div>
              </div>

              <div className="panel ai-panel">
                <div className="panel-icon">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="eyebrow">TÌM KIẾM THÔNG MINH</p>
                  <h3>Tìm kiếm theo câu chuyện & EXIF</h3>
                  <p>Tìm nhanh ảnh theo địa điểm, cảm xúc, thông số máy ảnh hoặc câu chuyện kỷ niệm.</p>
                  <button className="text-button ai-link" onClick={() => setActiveTab('ai')}>
                    Trải nghiệm tìm kiếm AI →
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* TAB: MEDIA (ALL) */}
        {activeTab === 'media' && (
          <section>
            <div className="section-head">
              <h2>Tất cả kỷ niệm ({media.length})</h2>
              <div className="album-head-actions">
                <button className="secondary" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} />
                  <span>Thêm ảnh mới</span>
                </button>
              </div>
            </div>

            {/* Tag Filter */}
            {(allTags.length > 0 || allYears.length > 0) && (
              <div className="filter-scroll-container">
                <div className="tag-bar">
                  <button
                    className={`tag-chip ${!selectedTag && !selectedYear ? 'active' : ''}`}
                    onClick={() => { setSelectedTag(null); setSelectedYear(null); }}
                  >
                    Tất cả ({media.length})
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                  {allYears.map(year => (
                    <button
                      key={year}
                      className={`tag-chip year-chip ${selectedYear === year ? 'active' : ''}`}
                      onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                    >
                      Năm {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredMedia.length === 0 ? (
              <div className="empty">
                <ImageIcon size={48} className="empty-icon" />
                <h3>Chưa có ảnh nào phù hợp</h3>
                <p>Thử xóa bộ lọc hoặc tải thêm ảnh kỷ niệm mới vào tài khoản của bạn.</p>
                <button className="primary" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} />
                  <span>Thêm kỷ niệm ngay</span>
                </button>
              </div>
            ) : (
              <div className="memory-grid">
                {filteredMedia.map(item => (
                  <div
                    key={item.id}
                    className="memory-card"
                    onClick={() => setDetailMemory(item)}
                  >
                    <div className="memory-image">
                      <SmartImage src={item.storage_key} alt={item.title || 'Memory'} loading="lazy" />
                      <button
                        className={`favorite ${item.is_favorite ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(item.id, e)}
                      >
                        <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                      {item.location && (
                        <div className="photo-location-pill">📍 {item.location}</div>
                      )}
                      {item.exif_data?.model && (
                        <div className="photo-exif-badge">📷 {item.exif_data.model}</div>
                      )}
                    </div>
                    <div className="memory-info">
                      <div>
                        <h3>{item.title || 'Không có tiêu đề'}</h3>
                        <p>{item.taken_at || item.created_at?.slice(0, 10)}</p>
                      </div>
                      {item.album_id && <span className="album-indicator">📁</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB: ALBUMS */}
        {activeTab === 'albums' && (
          <section>
            {selectedAlbumId ? (
              // Viewing specific album
              <div>
                {(() => {
                  const currAlbum = albums.find(a => a.id === selectedAlbumId)
                  const albumMedia = media.filter(m => m.album_id === selectedAlbumId)
                  return (
                    <>
                      <div className="section-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button
                            className="secondary"
                            onClick={() => setSelectedAlbumId(null)}
                            style={{ padding: '6px 12px' }}
                          >
                            ← Quay lại
                          </button>
                          <h2>{currAlbum?.name || 'Album'}</h2>
                        </div>
                        <div className="album-head-actions">
                          <button
                            className="secondary"
                            onClick={() => {
                              if (currAlbum) {
                                setEditingAlbum(currAlbum)
                                setAlbumForm({ name: currAlbum.name, description: currAlbum.description || '' })
                                setShowAddAlbumModal(true)
                              }
                            }}
                          >
                            <Edit2 size={15} />
                            <span>Sửa</span>
                          </button>
                          <button
                            className="secondary delete-btn"
                            onClick={(e) => handleDeleteAlbum(selectedAlbumId, e)}
                          >
                            <Trash2 size={15} />
                            <span>Xóa Album</span>
                          </button>
                        </div>
                      </div>

                      {currAlbum?.description && (
                        <p className="album-desc-banner">{currAlbum.description}</p>
                      )}

                      {albumMedia.length === 0 ? (
                        <div className="empty">
                          <FolderOpen size={44} className="empty-icon" />
                          <h3>Chưa có ảnh nào trong album này</h3>
                          <p>Hãy tải ảnh lên hoặc chọn album này khi thêm ảnh mới.</p>
                          <button
                            className="primary"
                            onClick={() => {
                              setUrlForm(prev => ({ ...prev, album_id: selectedAlbumId }))
                              setShowAddModal(true)
                            }}
                          >
                            <Plus size={16} />
                            <span>Thêm ảnh vào Album</span>
                          </button>
                        </div>
                      ) : (
                        <div className="memory-grid">
                          {albumMedia.map(item => (
                            <div
                              key={item.id}
                              className="memory-card"
                              onClick={() => setDetailMemory(item)}
                            >
                              <div className="memory-image">
                                <SmartImage src={item.storage_key} alt={item.title || 'Memory'} loading="lazy" />
                                <button
                                  className={`favorite ${item.is_favorite ? 'active' : ''}`}
                                  onClick={(e) => toggleFavorite(item.id, e)}
                                >
                                  <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                                </button>
                                {item.location && <div className="photo-location-pill">📍 {item.location}</div>}
                                {item.exif_data?.model && (
                                  <div className="photo-exif-badge">📷 {item.exif_data.model}</div>
                                )}
                              </div>
                              <div className="memory-info">
                                <div>
                                  <h3>{item.title || 'Không có tiêu đề'}</h3>
                                  <p>{item.taken_at || item.created_at?.slice(0, 10)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            ) : (
              // All albums list
              <div>
                <div className="section-head">
                  <h2>Bộ sưu tập Album ({albums.length})</h2>
                  <button className="primary" onClick={() => { setEditingAlbum(null); setAlbumForm({ name: '', description: '' }); setShowAddAlbumModal(true); }}>
                    <FolderPlus size={16} />
                    <span>Tạo Album mới</span>
                  </button>
                </div>

                {albums.length === 0 ? (
                  <div className="empty">
                    <FolderOpen size={48} className="empty-icon" />
                    <h3>Chưa có album nào</h3>
                    <p>Tạo album để gom nhóm những chuyến du lịch, sự kiện đặc biệt hoặc những ngày thường nhật.</p>
                    <button className="primary" onClick={() => { setEditingAlbum(null); setAlbumForm({ name: '', description: '' }); setShowAddAlbumModal(true); }}>
                      <FolderPlus size={16} />
                      <span>Tạo Album đầu tiên</span>
                    </button>
                  </div>
                ) : (
                  <div className="album-grid">
                    {albums.map(alb => {
                      const albumPhotos = media.filter(m => m.album_id === alb.id)
                      const coverPhoto = albumPhotos.find(m => m.id === alb.cover_media_id) || albumPhotos[0]
                      return (
                        <div
                          key={alb.id}
                          className="album-card"
                          onClick={() => setSelectedAlbumId(alb.id)}
                        >
                          <div className="album-cover">
                            {coverPhoto ? (
                              <SmartImage src={coverPhoto.storage_key} alt={alb.name} />
                            ) : (
                              <div className="album-empty-cover">
                                <FolderOpen size={36} color="#c5bfb3" />
                              </div>
                            )}
                            <span className="album-badge">{albumPhotos.length} ảnh</span>
                          </div>
                          <div className="album-info">
                            <h3>{alb.name}</h3>
                            <p>{alb.description || 'Không có mô tả'}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* TAB: FAVORITES */}
        {activeTab === 'favorites' && (
          <section>
            <div className="section-head">
              <h2>Khoảnh khắc yêu thích ❤️</h2>
              <span className="count">{filteredMedia.length} bức ảnh</span>
            </div>

            {filteredMedia.length === 0 ? (
              <div className="empty">
                <Heart size={48} className="empty-icon" />
                <h3>Chưa có ảnh yêu thích nào</h3>
                <p>Nhấp vào biểu tượng trái tim trên bất kỳ bức ảnh nào để lưu vào danh sách yêu thích của bạn.</p>
              </div>
            ) : (
              <div className="memory-grid">
                {filteredMedia.map(item => (
                  <div
                    key={item.id}
                    className="memory-card"
                    onClick={() => setDetailMemory(item)}
                  >
                    <div className="memory-image">
                      <SmartImage src={item.storage_key} alt={item.title || 'Memory'} loading="lazy" />
                      <button
                        className={`favorite ${item.is_favorite ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(item.id, e)}
                      >
                        <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                      {item.location && <div className="photo-location-pill">📍 {item.location}</div>}
                      {item.exif_data?.model && (
                        <div className="photo-exif-badge">📷 {item.exif_data.model}</div>
                      )}
                    </div>
                    <div className="memory-info">
                      <div>
                        <h3>{item.title || 'Không có tiêu đề'}</h3>
                        <p>{item.taken_at || item.created_at?.slice(0, 10)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB: TIMELINE */}
        {activeTab === 'timeline' && (
          <section>
            <div className="section-head">
              <h2>Dòng thời gian kỷ niệm</h2>
              <span className="count">{filteredMedia.length} khoảnh khắc</span>
            </div>

            {filteredMedia.length === 0 ? (
              <div className="empty">
                <RotateCcw size={48} className="empty-icon" />
                <h3>Dòng thời gian đang trống</h3>
                <p>Tải ảnh lên để xây dựng cuốn biên niên sử hình ảnh theo thời gian.</p>
              </div>
            ) : (
              <div className="timeline-list">
                {filteredMedia.map(item => (
                  <div
                    key={item.id}
                    className="timeline-item"
                    onClick={() => setDetailMemory(item)}
                  >
                    <SmartImage src={item.storage_key} alt={item.title || 'Memory'} className="timeline-thumb" />
                    <div className="timeline-content">
                      <div className="timeline-date">
                        📅 {item.taken_at || item.created_at?.slice(0, 10)} {item.location ? `· 📍 ${item.location}` : ''}
                      </div>
                      <h3>{item.title || 'Kỷ niệm'}</h3>
                      <p>{item.description || 'Không có ghi chú thêm.'}</p>
                      {item.ai_tags && item.ai_tags.length > 0 && (
                        <div className="timeline-tags">
                          {item.ai_tags.map(t => <span key={t}>#{t}</span>)}
                        </div>
                      )}
                      {item.exif_data?.model && (
                        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                          📷 {item.exif_data.make ? `${item.exif_data.make} ` : ''}{item.exif_data.model}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB: AI SEARCH */}
        {activeTab === 'ai' && (
          <section>
            <div className="ai-search-hero">
              <h2>
                <Sparkles size={24} />
                Tìm kiếm Kỷ niệm Thông minh
              </h2>
              <p>
                Nhập bất kỳ câu hỏi, cảm xúc, địa điểm, ngày tháng hoặc thông số ảnh để tìm kiếm nhanh trong kho lưu trữ của bạn.
              </p>

              <div className="ai-search-input-wrap">
                <Search size={18} color="#3e7752" />
                <input
                  type="text"
                  placeholder="Nhập tìm kiếm nhanh (VD: hoàng hôn trên biển, chuyến đi Đà Lạt, ảnh chụp với máy Sony, bạn bè)..."
                  value={aiSearchInput}
                  onChange={e => setAiSearchInput(e.target.value)}
                />
                {aiSearchInput && (
                  <button className="clear-search" onClick={() => setAiSearchInput('')}>
                    <X size={16} />
                  </button>
                )}
                <button className="ai-search-btn" onClick={() => {}}>
                  <span>Tìm ngay</span>
                </button>
              </div>

              {/* Suggestions list */}
              <div className="ai-suggestions-list">
                <span>Gợi ý tìm nhanh:</span>
                <button className="ai-pill-btn" onClick={() => setAiSearchInput('hoàng hôn')}>🌅 Hoàng hôn</button>
                <button className="ai-pill-btn" onClick={() => setAiSearchInput('biển')}>🏖️ Biển xanh</button>
                <button className="ai-pill-btn" onClick={() => setAiSearchInput('cà phê')}>☕ Cà phê</button>
                <button className="ai-pill-btn" onClick={() => setAiSearchInput('bạn bè')}>👥 Bạn bè</button>
                <button className="ai-pill-btn" onClick={() => setAiSearchInput('Đà Lạt')}>🌲 Đà Lạt</button>
                <button className="ai-pill-btn" onClick={() => setAiSearchInput('Hà Nội')}>🏛️ Hà Nội</button>
                <button className="ai-pill-btn" onClick={() => setAiSearchInput('Sony')}>📷 Máy Sony</button>
                <button className="ai-pill-btn" onClick={() => setAiSearchInput('iPhone')}>📱 iPhone</button>
                {allYears.map(y => (
                  <button key={y} className="ai-pill-btn" onClick={() => setAiSearchInput(y)}>Năm {y}</button>
                ))}
              </div>
            </div>

            <div className="section-head">
              <h2>Kết quả tìm kiếm ({filteredMedia.length})</h2>
              {aiSearchInput && (
                <button className="secondary" onClick={() => setAiSearchInput('')} style={{ fontSize: 12, padding: '4px 10px' }}>
                  Xóa tìm kiếm
                </button>
              )}
            </div>

            {filteredMedia.length === 0 ? (
              <div className="empty">
                <Search size={44} className="empty-icon" />
                <h3>Không tìm thấy kỷ niệm nào phù hợp</h3>
                <p>Thử thay đổi từ khóa hoặc tìm kiếm theo thẻ chủ đề khác.</p>
              </div>
            ) : (
              <div className="memory-grid">
                {filteredMedia.map(item => (
                  <div
                    key={item.id}
                    className="memory-card"
                    onClick={() => setDetailMemory(item)}
                  >
                    <div className="memory-image">
                      <SmartImage src={item.storage_key} alt={item.title || 'Memory'} loading="lazy" />
                      <button
                        className={`favorite ${item.is_favorite ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(item.id, e)}
                      >
                        <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                      {item.location && <div className="photo-location-pill">📍 {item.location}</div>}
                      {item.exif_data?.model && (
                        <div className="photo-exif-badge">📷 {item.exif_data.model}</div>
                      )}
                    </div>
                    <div className="memory-info">
                      <div>
                        <h3>{item.title || 'Không có tiêu đề'}</h3>
                        <p>{item.taken_at || item.created_at?.slice(0, 10)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB: SETTINGS & SUPABASE */}
        {activeTab === 'settings' && (
          <section>
            <div className="section-head">
              <h2>Cài đặt tài khoản & Cơ sở dữ liệu</h2>
            </div>

            <div className="settings-grid">
              {/* Account Information Card */}
              <div className="settings-card">
                <div>
                  <div className="settings-card-header">
                    <User size={26} className="icon-accent" />
                    <div>
                      <h3>Tài khoản: {currentUser.name}</h3>
                      <p className="sub-text">
                        Email: <strong>{currentUser.email}</strong>
                        <br />
                        Không gian dữ liệu: <code>DB_{currentUser.id}</code> (Độc lập 100%)
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    className="secondary"
                    onClick={() => {
                      setShowAuthModal(true)
                      setAuthModalTab('profile')
                    }}
                  >
                    <Edit2 size={15} />
                    <span>Đổi tên hiển thị</span>
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      setShowAuthModal(true)
                      setAuthModalTab('change_password')
                    }}
                  >
                    <KeyRound size={15} />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      setShowAuthModal(true)
                      setAuthModalTab('switch_account')
                    }}
                  >
                    <UserPlus size={15} />
                    <span>Chuyển tài khoản</span>
                  </button>
                  <button
                    className="secondary delete-btn"
                    onClick={handleLogout}
                    title="Đăng xuất khỏi thiết bị"
                  >
                    <LogOut size={15} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>

              {/* Supabase Integration Card */}
              <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
                <div>
                  <div className="settings-card-header">
                    <Database size={26} className="icon-blue" />
                    <div>
                      <h3>Liên kết Cơ sở dữ liệu Supabase (Tùy chọn)</h3>
                      <p className="sub-text">
                        Kết nối với dự án Supabase cá nhân để lưu trữ và đồng bộ hóa hình ảnh lên Cloud đám mây, sao lưu trực tuyến an toàn.
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                    <div className="form-row">
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                          Supabase Project URL:
                        </label>
                        <input
                          type="text"
                          className="full"
                          placeholder="https://xyzcompany.supabase.co"
                          value={supabaseForm.url}
                          onChange={e => setSupabaseForm(prev => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                          Supabase Anon / Public Key:
                        </label>
                        <input
                          type="password"
                          className="full"
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          value={supabaseForm.anonKey}
                          onChange={e => setSupabaseForm(prev => ({ ...prev, anonKey: e.target.value }))}
                        />
                      </div>
                    </div>

                    {supabaseStatus.text && (
                      <div className={`alert-box ${supabaseStatus.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {supabaseStatus.text}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className="secondary"
                    onClick={handleTestSupabase}
                    disabled={supabaseTesting}
                  >
                    <RefreshCw size={15} className={supabaseTesting ? 'spin' : ''} />
                    <span>{supabaseTesting ? 'Đang kiểm tra...' : 'Kiểm tra & Lưu cấu hình'}</span>
                  </button>
                  <button
                    className="primary"
                    onClick={handleSyncToSupabase}
                    disabled={supabaseSyncing || !supabaseForm.url}
                  >
                    <Upload size={15} />
                    <span>{supabaseSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ảnh lên Supabase'}</span>
                  </button>
                  <button
                    className="secondary"
                    onClick={handlePullFromSupabase}
                    disabled={supabaseSyncing || !supabaseForm.url}
                  >
                    <Download size={15} />
                    <span>Tải dữ liệu từ Supabase về</span>
                  </button>
                </div>
              </div>

              {/* Local Backup & Export Card */}
              <div className="settings-card">
                <div>
                  <div className="settings-card-header">
                    <FileDown size={26} className="icon-gold" />
                    <div>
                      <h3>Sao lưu & Xuất dữ liệu (.JSON)</h3>
                      <p className="sub-text">
                        Tải toàn bộ {media.length} bức ảnh và {albums.length} album của tài khoản {currentUser.name} về máy tính.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <button className="primary full" onClick={handleExportBackup}>
                    <FileDown size={16} />
                    <span>Tải tệp sao lưu JSON về máy</span>
                  </button>
                </div>
              </div>

              {/* Restore Backup Card */}
              <div className="settings-card">
                <div>
                  <div className="settings-card-header">
                    <FileUp size={26} className="icon-sage" />
                    <div>
                      <h3>Khôi phục từ tệp sao lưu</h3>
                      <p className="sub-text">
                        Nhập tệp sao lưu .json đã tải trước đây để phục hồi toàn bộ ảnh và nhật ký.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    ref={backupInputRef}
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImportBackup}
                  />
                  <button
                    className="secondary full"
                    onClick={() => backupInputRef.current?.click()}
                  >
                    <FileUp size={16} />
                    <span>Chọn tệp JSON để phục hồi</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone: Clear Data */}
              <div className="settings-card" style={{ borderColor: '#f4c7be' }}>
                <div>
                  <div className="settings-card-header">
                    <Trash2 size={26} className="icon-warn" />
                    <div>
                      <h3 style={{ color: '#a6442e' }}>Xóa dữ liệu tài khoản</h3>
                      <p className="sub-text">
                        Xóa sạch toàn bộ ảnh và album của tài khoản hiện tại trong IndexedDB trình duyệt.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    className="secondary delete-btn full"
                    onClick={handleClearAccountData}
                  >
                    <Trash2 size={16} />
                    <span>Xóa toàn bộ ảnh của tôi</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL: ADD MEMORY */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowAddModal(false)}>
              <X size={20} />
            </button>

            <h2>Thêm Kỷ Niệm Mới</h2>
            <p className="modal-copy">
              Lưu giữ hình ảnh và những cảm xúc đáng nhớ vào không gian riêng tư của bạn.
            </p>

            {/* Switch Mode: Device Upload vs URL */}
            <div className="tab-pill-switcher">
              <button
                className={uploadMode === 'device' ? 'active' : ''}
                onClick={() => setUploadMode('device')}
              >
                <Upload size={15} />
                <span>Từ máy tính / Điện thoại</span>
              </button>
              <button
                className={uploadMode === 'url' ? 'active' : ''}
                onClick={() => setUploadMode('url')}
              >
                <LinkIcon size={15} />
                <span>Từ liên kết URL ảnh</span>
              </button>
            </div>

            {/* EXIF Checkbox Option */}
            <label className="checkbox-label" style={{ marginBottom: 14 }}>
              <input
                type="checkbox"
                checked={parseExifOption}
                onChange={e => setParseExifOption(e.target.checked)}
              />
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>
                Đọc & hiển thị thông số ảnh EXIF (Exchangeable Image File Format: Máy ảnh, ISO, Ngày chụp, Vị trí)
              </span>
            </label>

            {/* DEVICE UPLOAD SECTION */}
            {uploadMode === 'device' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />

                <div
                  className={`dropzone ${isDragging ? 'dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload size={32} className="dropzone-icon" />
                  <p><strong>Nhấp để chọn ảnh</strong> hoặc kéo thả ảnh vào đây</p>
                  <small>Hỗ trợ JPG, PNG, WEBP, HEIC. Tự động tối ưu dung lượng và đọc EXIF.</small>
                  {isUploading && <p className="uploading-text">Đang xử lý & trích xuất dữ liệu ảnh...</p>}
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="uploaded-preview-grid">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="preview-thumb">
                        <img src={f.url} alt={`Preview ${i}`} />
                        <button
                          className="thumb-remove"
                          onClick={(e) => {
                            e.stopPropagation()
                            setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* URL UPLOAD SECTION */}
            {uploadMode === 'url' && (
              <div className="url-upload-section">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>
                      Đường dẫn URL ảnh trực tuyến:
                    </label>
                    <button
                      type="button"
                      className="text-button"
                      style={{ position: 'static', padding: 0, fontSize: 11.5 }}
                      onClick={handlePasteFromClipboard}
                    >
                      📋 Dán từ Clipboard
                    </button>
                  </div>

                  <textarea
                    className="url-textarea"
                    placeholder="Dán link ảnh từ Google Photos, Google Drive, Unsplash, Imgur, Dropbox hoặc bất kỳ trang web nào... (Có thể dán nhiều link cách nhau bằng dòng mới)"
                    value={urlInputText}
                    onChange={e => {
                      setUrlInputText(e.target.value)
                      setUrlPreviewStatus('idle')
                    }}
                  />

                  <div className="url-actions-bar">
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="secondary"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => handleTestUrl()}
                      >
                        <Eye size={14} />
                        <span>Kiểm tra & Xem thử</span>
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={handleAutoExtractUrlMeta}
                      >
                        <Sparkles size={14} />
                        <span>Gợi ý thẻ & tên</span>
                      </button>
                      {isGooglePhotosWebPage(urlInputText) && (
                        <button
                          type="button"
                          className="primary"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={handleAutoResolveGooglePhotos}
                        >
                          <Sparkles size={14} />
                          <span>⚡ Tìm link ảnh gốc</span>
                        </button>
                      )}
                    </div>

                    {urlDetectedSource && (
                      <span className="url-detected-chip">
                        <ImageIcon size={12} /> Nguồn: {urlDetectedSource}
                      </span>
                    )}
                  </div>
                </div>

                {/* Google Photos Dedicated Helper Banner */}
                {isGooglePhotosWebPage(urlInputText) && (
                  <div className="google-photos-tip-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                      <span>📷 Mẹo hiển thị ảnh Google Photos trực tiếp:</span>
                    </div>
                    <div>
                      Link bạn đang dán là trang web Google Photos. Để ảnh luôn hiển thị sắc nét & không bị chặn:
                      <ol className="google-photos-steps">
                        <li>Trên Google Photos, nhấp <strong>chuột phải vào ảnh</strong>.</li>
                        <li>Chọn <strong>"Sao chép địa chỉ hình ảnh"</strong> (Copy image address).</li>
                        <li>Dán link vừa copy (có dạng <code>https://lh3.googleusercontent.com/...</code>) vào ô trên.</li>
                      </ol>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: 11.5, padding: '4px 10px' }}
                          onClick={handleAutoResolveGooglePhotos}
                        >
                          ⚡ Thử giải mã tự động
                        </button>
                        <span style={{ fontSize: 11, color: '#8c6b1b' }}>
                          Hoặc chuyển sang tab <strong>"Từ máy tính / Điện thoại"</strong> để tải ảnh về máy nhanh nhất.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Offline persistence toggle */}
                <label className="checkbox-label" style={{ marginTop: 2 }}>
                  <input
                    type="checkbox"
                    checked={urlOfflineSaveOption}
                    onChange={e => setUrlOfflineSaveOption(e.target.checked)}
                  />
                  <span>
                    <strong>Tải & lưu dữ liệu ảnh vào bộ nhớ máy</strong>
                    <br />
                    <small style={{ color: 'var(--muted)', fontWeight: 'normal' }}>
                      Khuyên dùng: chuyển ảnh thành dữ liệu nội bộ để xem vĩnh viễn không lo link hết hạn hoặc mất kết nối.
                    </small>
                  </span>
                </label>

                {/* Live URL Preview */}
                {urlInputText.trim() && (
                  <div className="url-preview-card">
                    <SmartImage
                      src={urlInputText.split(/[\n,;]/)[0]?.trim()}
                      alt="URL Preview"
                      className="url-preview-img"
                      onLoad={() => setUrlPreviewStatus('valid')}
                      onError={() => setUrlPreviewStatus('valid')}
                    />
                    <div className="url-preview-meta">
                      {urlPreviewStatus === 'loading' && (
                        <span className="url-status-badge loading">
                          <RefreshCw size={12} className="spin" /> Đang kiểm tra link ảnh...
                        </span>
                      )}
                      {urlPreviewStatus === 'valid' && (
                        <span className="url-status-badge valid">
                          <Check size={12} /> Link ảnh hợp lệ & sẵn sàng lưu
                        </span>
                      )}
                      {urlPreviewStatus === 'error' && (
                        <span className="url-status-badge error">
                          <X size={12} /> Không thể tải trực tiếp (sẽ dùng proxy tự động)
                        </span>
                      )}
                      <p>{urlInputText.split(/[\n,;]/)[0]?.trim()}</p>
                      {urlInputText.split(/[\n,;]/).filter(u => u.trim().startsWith('http')).length > 1 && (
                        <small style={{ color: '#2b568e', fontWeight: 600, display: 'block', marginTop: 4 }}>
                          📦 Đã nhận diện {urlInputText.split(/[\n,;]/).filter(u => u.trim().startsWith('http')).length} liên kết ảnh sẽ được thêm cùng lúc!
                        </small>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FORM METADATA */}
            <div className="modal-form" style={{ marginTop: 14 }}>
              <div className="form-row">
                <label>
                  Tiêu đề kỷ niệm:
                  <input
                    type="text"
                    placeholder="VD: Chiều hoàng hôn Hồ Tây..."
                    value={urlForm.title}
                    onChange={e => setUrlForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </label>
                <label>
                  Ngày chụp / Diễn ra:
                  <input
                    type="date"
                    value={urlForm.taken_at}
                    onChange={e => setUrlForm(prev => ({ ...prev, taken_at: e.target.value }))}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Địa điểm:
                  <input
                    type="text"
                    placeholder="VD: Đà Lạt, Lâm Đồng"
                    value={urlForm.location}
                    onChange={e => setUrlForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </label>
                <label>
                  Xếp vào Album:
                  <select
                    value={urlForm.album_id}
                    onChange={e => setUrlForm(prev => ({ ...prev, album_id: e.target.value }))}
                  >
                    <option value="">-- Không xếp vào album --</option>
                    {albums.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Ghi chú cảm xúc & Câu chuyện:
                <textarea
                  rows={2}
                  placeholder="Viết một vài dòng ghi lại cảm xúc của bạn vào khoảnh khắc này..."
                  value={urlForm.description}
                  onChange={e => setUrlForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </label>

              <label>
                Thẻ chủ đề (#tags cách nhau bằng dấu phẩy):
                <input
                  type="text"
                  placeholder="VD: du lịch, bạn bè, hoàng hôn, mùa hè"
                  value={urlForm.tags}
                  onChange={e => setUrlForm(prev => ({ ...prev, tags: e.target.value }))}
                />
              </label>

              <button
                className="primary full"
                style={{ marginTop: 10 }}
                onClick={handleSaveMemory}
              >
                <Check size={16} />
                <span>Lưu kỷ niệm vào tài khoản</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL LIGHTBOX & SLIDESHOW */}
      {detailMemory && (
        <div className="modal-backdrop lightbox-backdrop" onClick={() => setDetailMemory(null)}>
          <div className="lightbox-modal" onClick={e => e.stopPropagation()}>
            <div className="lightbox-top-bar">
              <button
                className={`lightbox-action-btn ${slideshowActive ? 'active' : ''}`}
                onClick={() => setSlideshowActive(!slideshowActive)}
              >
                <Play size={14} />
                <span>{slideshowActive ? 'Dừng chiếu' : 'Trình chiếu'}</span>
              </button>
              <button
                className="lightbox-action-btn"
                onClick={() => handleDownloadImage(detailMemory)}
              >
                <Download size={14} />
                <span>Tải ảnh</span>
              </button>
              <button
                className="lightbox-action-btn"
                onClick={() => {
                  setEditingMemory(detailMemory)
                  setDetailMemory(null)
                }}
              >
                <Edit2 size={14} />
                <span>Sửa</span>
              </button>
              <button
                className="lightbox-action-btn delete-btn"
                onClick={() => handleDeleteMemory(detailMemory.id)}
              >
                <Trash2 size={14} />
                <span>Xóa</span>
              </button>
              <button className="close lightbox-close" onClick={() => setDetailMemory(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="lightbox-photo-stage">
              <SmartImage src={detailMemory.storage_key} alt={detailMemory.title || 'Memory'} className="lightbox-image" />
              <button className="lightbox-nav-btn prev" onClick={handlePrevDetail}>
                <ChevronLeft size={24} />
              </button>
              <button className="lightbox-nav-btn next" onClick={handleNextDetail}>
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="lightbox-info-pane">
              <div className="lightbox-title-row">
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>
                    📅 {detailMemory.taken_at || detailMemory.created_at?.slice(0, 10)} {detailMemory.location ? `· 📍 ${detailMemory.location}` : ''}
                  </p>
                  <h2>{detailMemory.title || 'Không có tiêu đề'}</h2>
                </div>
                <button
                  className={`favorite ${detailMemory.is_favorite ? 'active' : ''}`}
                  style={{ position: 'static' }}
                  onClick={() => toggleFavorite(detailMemory.id)}
                >
                  <Heart size={20} fill={detailMemory.is_favorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              {detailMemory.description && (
                <p className="lightbox-caption">{detailMemory.description}</p>
              )}

              {/* EXIF Data Box */}
              {detailMemory.exif_data && (
                <div className="exif-details-box">
                  <div className="exif-details-title">
                    <Camera size={15} />
                    <span>Thông số kỹ thuật ảnh (EXIF Metadata)</span>
                  </div>
                  <div className="exif-grid">
                    {detailMemory.exif_data.model && (
                      <div className="exif-item">
                        Thiết bị: <strong>{detailMemory.exif_data.make ? `${detailMemory.exif_data.make} ` : ''}{detailMemory.exif_data.model}</strong>
                      </div>
                    )}
                    {detailMemory.exif_data.focalLength && (
                      <div className="exif-item">
                        Tiêu cự: <strong>{detailMemory.exif_data.focalLength}mm</strong>
                      </div>
                    )}
                    {detailMemory.exif_data.fNumber && (
                      <div className="exif-item">
                        Khẩu độ: <strong>f/{detailMemory.exif_data.fNumber}</strong>
                      </div>
                    )}
                    {detailMemory.exif_data.iso && (
                      <div className="exif-item">
                        Độ nhạy ISO: <strong>ISO {detailMemory.exif_data.iso}</strong>
                      </div>
                    )}
                    {detailMemory.exif_data.exposureTime && (
                      <div className="exif-item">
                        Tốc độ chụp: <strong>{detailMemory.exif_data.exposureTime}</strong>
                      </div>
                    )}
                    {(detailMemory.exif_data.imageWidth && detailMemory.exif_data.imageHeight) && (
                      <div className="exif-item">
                        Độ phân giải: <strong>{detailMemory.exif_data.imageWidth} × {detailMemory.exif_data.imageHeight}</strong>
                      </div>
                    )}
                    {(detailMemory.exif_data.latitude && detailMemory.exif_data.longitude) && (
                      <div className="exif-item">
                        Tọa độ GPS: <strong>{detailMemory.exif_data.latitude.toFixed(4)}°, {detailMemory.exif_data.longitude.toFixed(4)}°</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailMemory.ai_tags && detailMemory.ai_tags.length > 0 && (
                <div className="tag-bar lightbox-tags">
                  {detailMemory.ai_tags.map(tag => (
                    <span key={tag} className="tag-chip active">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMORY */}
      {editingMemory && (
        <div className="modal-backdrop" onClick={() => setEditingMemory(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setEditingMemory(null)}>
              <X size={20} />
            </button>
            <h2>Chỉnh Sửa Kỷ Niệm</h2>

            <form className="modal-form" onSubmit={handleSaveEditedMemory}>
              <label>
                Tiêu đề:
                <input
                  type="text"
                  value={editingMemory.title || ''}
                  onChange={e => setEditingMemory({ ...editingMemory, title: e.target.value })}
                />
              </label>

              <div className="form-row">
                <label>
                  Ngày:
                  <input
                    type="date"
                    value={editingMemory.taken_at || ''}
                    onChange={e => setEditingMemory({ ...editingMemory, taken_at: e.target.value })}
                  />
                </label>
                <label>
                  Địa điểm:
                  <input
                    type="text"
                    value={editingMemory.location || ''}
                    onChange={e => setEditingMemory({ ...editingMemory, location: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Album:
                <select
                  value={editingMemory.album_id || ''}
                  onChange={e => setEditingMemory({ ...editingMemory, album_id: e.target.value || null })}
                >
                  <option value="">-- Không xếp vào album --</option>
                  {albums.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Mô tả & Cảm xúc:
                <textarea
                  rows={3}
                  value={editingMemory.description || ''}
                  onChange={e => setEditingMemory({ ...editingMemory, description: e.target.value })}
                />
              </label>

              <label>
                Thẻ (#tags cách nhau bằng dấu phẩy):
                <input
                  type="text"
                  value={(editingMemory.ai_tags || []).join(', ')}
                  onChange={e => setEditingMemory({
                    ...editingMemory,
                    ai_tags: e.target.value.split(/[,#]/).map(t => t.trim()).filter(Boolean)
                  })}
                />
              </label>

              <button className="primary full" type="submit" style={{ marginTop: 10 }}>
                <Check size={16} />
                <span>Lưu thay đổi</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ALBUM */}
      {showAddAlbumModal && (
        <div className="modal-backdrop" onClick={() => setShowAddAlbumModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowAddAlbumModal(false)}>
              <X size={20} />
            </button>
            <h2>{editingAlbum ? 'Chỉnh Sửa Album' : 'Tạo Album Mới'}</h2>
            <p className="modal-copy">Gom nhóm những khoảnh khắc cùng chủ đề vào một bộ sưu tập.</p>

            <form className="modal-form" onSubmit={handleSaveAlbum}>
              <label>
                Tên Album:
                <input
                  type="text"
                  placeholder="VD: Du lịch Phú Quốc 2024, Khoảnh khắc gia đình..."
                  value={albumForm.name}
                  onChange={e => setAlbumForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>

              <label>
                Mô tả ngắn gọn:
                <textarea
                  rows={3}
                  placeholder="Mô tả về album kỷ niệm này..."
                  value={albumForm.description}
                  onChange={e => setAlbumForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </label>

              <button className="primary full" type="submit" style={{ marginTop: 10 }}>
                <Check size={16} />
                <span>{editingAlbum ? 'Cập nhật Album' : 'Tạo Album'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AUTH & ACCOUNT MANAGEMENT (Login, Register, Change Password, Profile) */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowAuthModal(false)}>
              <X size={20} />
            </button>

            <h2>Quản Lý Tài Khoản</h2>
            <p className="modal-copy">
              Mỗi tài khoản lưu trữ độc lập trên database riêng biệt, bảo mật và an toàn.
            </p>

            {/* Auth Tab Switcher */}
            <div className="tab-pill-switcher">
              <button
                className={authModalTab === 'profile' ? 'active' : ''}
                onClick={() => {
                  setAuthModalTab('profile')
                  setAuthProfileForm({ name: currentUser?.name || '' })
                  setAuthError('')
                  setAuthSuccess('')
                }}
              >
                <Edit2 size={14} />
                <span>Tên hiển thị</span>
              </button>
              <button
                className={authModalTab === 'change_password' ? 'active' : ''}
                onClick={() => { setAuthModalTab('change_password'); setAuthError(''); setAuthSuccess(''); }}
              >
                <KeyRound size={14} />
                <span>Đổi mật khẩu</span>
              </button>
              <button
                className={authModalTab === 'switch_account' ? 'active' : ''}
                onClick={() => { setAuthModalTab('switch_account'); setAuthError(''); setAuthSuccess(''); }}
              >
                <UserCheck size={14} />
                <span>Đổi tài khoản</span>
              </button>
            </div>

            {authError && <div className="alert-box alert-error">{authError}</div>}
            {authSuccess && <div className="alert-box alert-success">{authSuccess}</div>}

            {/* PROFILE EDIT FORM */}
            {authModalTab === 'profile' && (
              <form className="modal-form" onSubmit={handleUpdateProfile}>
                <label>
                  Tên hiển thị:
                  <input
                    type="text"
                    value={authProfileForm.name}
                    onChange={e => setAuthProfileForm({ name: e.target.value })}
                    required
                  />
                </label>
                <p style={{ fontSize: 12, color: '#777' }}>
                  Tiêu đề trang web sẽ tự động đổi thành: <strong>{authProfileForm.name || '...'} - Memories Tìm kỷ niệm nhanh</strong>
                </p>

                <button className="primary full" type="submit" style={{ marginTop: 10 }}>
                  <Check size={16} />
                  <span>Lưu thay đổi tên</span>
                </button>
              </form>
            )}

            {/* CHANGE PASSWORD FORM */}
            {authModalTab === 'change_password' && (
              <form className="modal-form" onSubmit={handleChangePassword}>
                <label>
                  Mật khẩu hiện tại:
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPasswordForm.oldPassword}
                    onChange={e => setAuthPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Mật khẩu mới:
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={authPasswordForm.newPassword}
                    onChange={e => setAuthPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Xác nhận mật khẩu mới:
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={authPasswordForm.confirmPassword}
                    onChange={e => setAuthPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </label>

                <button className="primary full" type="submit" style={{ marginTop: 10 }}>
                  <KeyRound size={16} />
                  <span>Xác nhận đổi mật khẩu</span>
                </button>
              </form>
            )}

            {/* SWITCH ACCOUNT / LOGIN FORM */}
            {authModalTab === 'switch_account' && (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                    Chọn tài khoản khác trên thiết bị này hoặc đăng nhập tài khoản mới:
                  </p>
                  <div className="auth-quick-account-chips">
                    {getAllRegisteredAccounts().map(acc => (
                      <div
                        key={acc.id}
                        className={`auth-account-chip ${acc.id === currentUser?.id ? 'active' : ''}`}
                        onClick={() => {
                          if (acc.id !== currentUser?.id) {
                            handleLogin(undefined, acc)
                          }
                        }}
                        style={acc.id === currentUser?.id ? { borderColor: '#b27a3c', background: '#fcf6ec' } : {}}
                      >
                        <div className="auth-account-chip-avatar">
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{acc.name} ({acc.email}) {acc.id === currentUser?.id ? '★ Đang dùng' : ''}</span>
                        {acc.id !== currentUser?.id && <ChevronRight size={13} color="#999" />}
                      </div>
                    ))}
                  </div>
                </div>

                <form className="modal-form" onSubmit={(e) => handleLogin(e)}>
                  <label>
                    Địa chỉ Email khác:
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={authLoginForm.email}
                      onChange={e => setAuthLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Mật khẩu:
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={authLoginForm.password}
                      onChange={e => setAuthLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </label>

                  <button className="primary full" type="submit" style={{ marginTop: 10 }}>
                    <UserCheck size={16} />
                    <span>Đăng nhập & chuyển tài khoản</span>
                  </button>

                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <button
                      type="button"
                      className="secondary full delete-btn"
                      onClick={handleLogout}
                      style={{ marginTop: 8 }}
                    >
                      <LogOut size={15} />
                      <span>Đăng xuất khỏi thiết bị này</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notice && (
        <div className="toast" onClick={() => setNotice('')}>
          <span>{notice}</span>
          <X size={14} />
        </div>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
