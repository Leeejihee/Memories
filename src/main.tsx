import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  FileDown,
  FileUp,
  FolderOpen,
  FolderPlus,
  Heart,
  Home,
  Image as ImageIcon,
  LogOut,
  Maximize2,
  Menu,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  X
} from 'lucide-react'
import {
  AlbumItem,
  MediaItem,
  UserProfile,
  compressImageFile,
  deleteAlbumFromDB,
  deleteMediaItemFromDB,
  getAllAlbumsFromDB,
  getAllMediaFromDB,
  saveAllAlbumsToDB,
  saveAllMediaToDB,
  saveMediaItemToDB
} from './db'
import './styles.css'

const initialDemoMedia: MediaItem[] = [
  {
    id: 'demo-1',
    file_name: 'dalat.jpg',
    mime_type: 'image/jpeg',
    source: 'external_url',
    storage_key: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    title: 'Đà Lạt trong sương',
    description: 'Một sớm mai mù sương se lạnh giữa đồi thông ngút ngàn, tiếng chim ríu rít và hương hoa thoang thoảng.',
    taken_at: '2024-05-24',
    ai_tags: ['Đà Lạt', 'du lịch', 'núi rừng', 'sương sớm', 'yên bình'],
    is_favorite: true,
    album_id: 'album-travel',
    location: 'Đà Lạt, Lâm Đồng',
    created_at: '2024-05-24T08:00:00Z'
  },
  {
    id: 'demo-2',
    file_name: 'sunset.jpg',
    mime_type: 'image/jpeg',
    source: 'external_url',
    storage_key: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',
    title: 'Chiều hoàng hôn bình yên',
    description: 'Mặt trời lặn nhuộm vàng cả góc trời, ngắm hoàng hôn buông xuống thật êm đềm.',
    taken_at: '2024-06-02',
    ai_tags: ['hoàng hôn', 'thiên nhiên', 'mặt trời', 'yên bình'],
    is_favorite: true,
    album_id: 'album-travel',
    location: 'Hồ Tây, Hà Nội',
    created_at: '2024-06-02T18:00:00Z'
  },
  {
    id: 'demo-3',
    file_name: 'friends.jpg',
    mime_type: 'image/jpeg',
    source: 'external_url',
    storage_key: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85',
    title: 'Ngày bên bạn bè',
    description: 'Tụ họp cùng những người bạn thân thiết, nói cười rôm rả dưới ánh nắng rực rỡ.',
    taken_at: '2023-08-30',
    ai_tags: ['bạn bè', 'kỷ niệm', 'nụ cười', 'tuổi trẻ'],
    is_favorite: false,
    album_id: 'album-life',
    location: 'Công viên Thống Nhất, Hà Nội',
    created_at: '2023-08-30T10:00:00Z'
  },
  {
    id: 'demo-4',
    file_name: 'coffee.jpg',
    mime_type: 'image/jpeg',
    source: 'external_url',
    storage_key: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85',
    title: 'Một tách cà phê chiều mưa',
    description: 'Góc quán quen, cuốn sách hay và một tách cà phê thơm lừng trong một buổi chiều mưa nhè nhẹ.',
    taken_at: '2023-09-14',
    ai_tags: ['cà phê', 'sách', 'thư giãn', 'mưa'],
    is_favorite: false,
    album_id: 'album-life',
    location: 'Phố Cổ, Hà Nội',
    created_at: '2023-09-14T15:30:00Z'
  },
  {
    id: 'demo-5',
    file_name: 'hoian.jpg',
    mime_type: 'image/jpeg',
    source: 'external_url',
    storage_key: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85',
    title: 'Hội An lung linh hoa đăng',
    description: 'Dạo bước trên bờ sông Hoài ngắm dòng hoa đăng trôi lững lờ cùng những chiếc lồng đèn rực rỡ muôn màu.',
    taken_at: '2024-04-12',
    ai_tags: ['Hội An', 'đèn lồng', 'du lịch', 'đêm'],
    is_favorite: true,
    album_id: 'album-travel',
    location: 'Hội An, Quảng Nam',
    created_at: '2024-04-12T20:15:00Z'
  }
]

const initialDemoAlbums: AlbumItem[] = [
  { id: 'album-travel', name: 'Chuyến đi & Khám phá', description: 'Những cung đường, miền đất và hành trình đã qua', cover_media_id: 'demo-1', created_at: '2024-05-24' },
  { id: 'album-life', name: 'Khoảnh khắc thường ngày', description: 'Cà phê, bạn bè và những buổi chiều bình yên', cover_media_id: 'demo-3', created_at: '2023-08-30' }
]

const presetOptions = [
  { title: 'Hoàng hôn trên sông', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85', tags: ['hoàng hôn', 'sông nước', 'yên bình'], location: 'Huế' },
  { title: 'Góc ban công ngập nắng', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85', tags: ['nắng', 'cây xanh', 'thư giãn'], location: 'Nhà riêng' },
  { title: 'Chuyến tàu qua đèo', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85', tags: ['du lịch', 'núi rừng', 'hành trình'], location: 'Đèo Hải Vân' },
  { title: 'Biển xanh cát trắng', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85', tags: ['biển', 'mùa hè', 'nắng vàng'], location: 'Phú Quốc' },
  { title: 'Phố cổ về đêm', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85', tags: ['phố cổ', 'đêm', 'ẩm thực'], location: 'Hà Nội' },
]

function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mymemories_user')
    return saved ? JSON.parse(saved) : { id: 'default-user', email: 's2thanhyens2@gmail.com', name: 'Thanh Yến' }
  })
  const [authEmail, setAuthEmail] = useState('')
  const [authName, setAuthName] = useState('')

  const [media, setMedia] = useState<MediaItem[]>([])
  const [albums, setAlbums] = useState<AlbumItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const [activeTab, setActiveTab] = useState<'home' | 'media' | 'albums' | 'favorites' | 'timeline' | 'ai' | 'settings'>('home')
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)

  // Modals & States
  const [detailMemory, setDetailMemory] = useState<MediaItem | null>(null)
  const [editingMemory, setEditingMemory] = useState<MediaItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddAlbumModal, setShowAddAlbumModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [slideshowActive, setSlideshowActive] = useState(false)

  // Upload state
  const [uploadMode, setUploadMode] = useState<'device' | 'url' | 'preset'>('device')
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; file_name: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backupInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [urlForm, setUrlForm] = useState({
    url: '',
    title: '',
    description: '',
    location: '',
    taken_at: new Date().toISOString().slice(0, 10),
    tags: '',
    album_id: ''
  })

  const [albumForm, setAlbumForm] = useState({
    name: '',
    description: ''
  })

  // Load from IndexedDB upon user change
  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setIsLoaded(false)
      const dbMedia = await getAllMediaFromDB(user.email)
      const dbAlbums = await getAllAlbumsFromDB(user.email)
      if (!isMounted) return

      if (dbMedia.length === 0 && dbAlbums.length === 0) {
        // Seed default demo data for new profile
        await saveAllMediaToDB(initialDemoMedia, user.email)
        await saveAllAlbumsToDB(initialDemoAlbums, user.email)
        setMedia(initialDemoMedia)
        setAlbums(initialDemoAlbums)
      } else {
        setMedia(dbMedia)
        setAlbums(dbAlbums)
      }
      setIsLoaded(true)
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [user.email])

  // Save changes
  useEffect(() => {
    if (isLoaded) {
      saveAllMediaToDB(media, user.email)
    }
  }, [media, isLoaded, user.email])

  useEffect(() => {
    if (isLoaded) {
      saveAllAlbumsToDB(albums, user.email)
    }
  }, [albums, isLoaded, user.email])

  useEffect(() => {
    localStorage.setItem('mymemories_user', JSON.stringify(user))
  }, [user])

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

  // Available tags & years
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    media.forEach(m => m.ai_tags?.forEach(t => tagSet.add(t.trim())))
    return Array.from(tagSet).filter(Boolean)
  }, [media])

  const allYears = useMemo(() => {
    const yearSet = new Set<string>()
    media.forEach(m => {
      if (m.taken_at) {
        const yr = m.taken_at.slice(0, 4)
        if (yr) yearSet.add(yr)
      }
    })
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a))
  }, [media])

  // Filtered Media List
  const filtered = useMemo(() => {
    return media.filter(item => {
      if (activeTab === 'favorites' && !item.is_favorite) return false
      if (activeTab === 'albums' && selectedAlbumId && item.album_id !== selectedAlbumId) return false
      if (selectedTag && !item.ai_tags?.includes(selectedTag)) return false
      if (selectedYear && item.taken_at && !item.taken_at.startsWith(selectedYear)) return false

      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        item.title?.toLowerCase().includes(q) ||
        item.file_name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.taken_at?.includes(q) ||
        item.ai_tags?.some(t => t.toLowerCase().includes(q))
      )
    })
  }, [media, query, activeTab, selectedTag, selectedYear, selectedAlbumId])

  // Memories from this day in past years
  const todayMemories = useMemo(() => {
    const todayStr = new Date().toISOString().slice(5, 10) // MM-DD
    return media.filter(x => x.taken_at && x.taken_at.slice(5, 10) === todayStr)
  }, [media])

  const showToast = (msg: string) => {
    setNotice(msg)
    setTimeout(() => {
      setNotice(prev => (prev === msg ? '' : prev))
    }, 4000)
  }

  // Favorite toggle
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMedia(prev =>
      prev.map(m => {
        if (m.id === id) {
          const nextFav = !m.is_favorite
          showToast(nextFav ? '❤️ Đã lưu vào mục Yêu thích' : 'Đã bỏ khỏi Yêu thích')
          return { ...m, is_favorite: nextFav }
        }
        return m
      })
    )
    if (detailMemory && detailMemory.id === id) {
      setDetailMemory(prev => (prev ? { ...prev, is_favorite: !prev.is_favorite } : null))
    }
  }

  // Delete Memory
  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kỷ niệm này?')) return
    await deleteMediaItemFromDB(id)
    setMedia(prev => prev.filter(m => m.id !== id))
    setDetailMemory(null)
    setEditingMemory(null)
    showToast('Đã xóa kỷ niệm.')
  }

  // Batch / Single File Upload Handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    const newItems: { url: string; file_name: string }[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        const compressedDataUrl = await compressImageFile(file, 1600, 0.85)
        newItems.push({
          url: compressedDataUrl,
          file_name: file.name.replace(/\.[^/.]+$/, '')
        })
      }

      setUploadedFiles(prev => [...prev, ...newItems])
      if (newItems.length === 1 && !urlForm.title) {
        setUrlForm(prev => ({ ...prev, title: newItems[0].file_name }))
      }
      showToast(`Đã tải lên ${newItems.length} ảnh sẵn sàng để lưu`)
    } catch (err) {
      console.error(err)
      showToast('Lỗi khi tải ảnh. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
    }
  }

  // Save New Memory / Memories
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedTags = urlForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    if (uploadMode === 'device' && uploadedFiles.length > 0) {
      const newMemories: MediaItem[] = uploadedFiles.map((f, idx) => ({
        id: `mem-${Date.now()}-${idx}`,
        file_name: f.file_name,
        mime_type: 'image/jpeg',
        source: 'upload',
        storage_key: f.url,
        title: uploadedFiles.length === 1 ? (urlForm.title.trim() || f.file_name) : `${urlForm.title || f.file_name} (${idx + 1})`,
        description: urlForm.description.trim() || null,
        taken_at: urlForm.taken_at || new Date().toISOString().slice(0, 10),
        location: urlForm.location.trim() || null,
        ai_tags: parsedTags.length > 0 ? parsedTags : ['kỷ niệm', 'ảnh tải lên'],
        is_favorite: false,
        album_id: urlForm.album_id || null,
        created_at: new Date().toISOString()
      }))

      for (const item of newMemories) {
        await saveMediaItemToDB(item, user.email)
      }

      setMedia(prev => [...newMemories, ...prev])
      showToast(`Đã thêm thành công ${newMemories.length} kỷ niệm!`)
    } else {
      // URL or Preset mode
      if (!urlForm.url.trim()) {
        showToast('Vui lòng nhập đường dẫn ảnh hoặc chọn ảnh mẫu.')
        return
      }

      const newMemory: MediaItem = {
        id: `mem-${Date.now()}`,
        file_name: urlForm.title.trim() || 'Kỷ niệm mới',
        mime_type: 'image/jpeg',
        source: uploadMode === 'preset' ? 'preset' : 'external_url',
        storage_key: urlForm.url.trim(),
        title: urlForm.title.trim() || 'Kỷ niệm mới',
        description: urlForm.description.trim() || null,
        taken_at: urlForm.taken_at || new Date().toISOString().slice(0, 10),
        location: urlForm.location.trim() || null,
        ai_tags: parsedTags.length > 0 ? parsedTags : ['kỷ niệm'],
        is_favorite: false,
        album_id: urlForm.album_id || null,
        created_at: new Date().toISOString()
      }

      await saveMediaItemToDB(newMemory, user.email)
      setMedia(prev => [newMemory, ...prev])
      showToast('Đã lưu kỷ niệm vào không gian của bạn!')
    }

    // Reset Form
    setShowAddModal(false)
    setUploadedFiles([])
    setUrlForm({
      url: '',
      title: '',
      description: '',
      location: '',
      taken_at: new Date().toISOString().slice(0, 10),
      tags: '',
      album_id: ''
    })
  }

  // Update existing memory
  const handleUpdateMemory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMemory) return

    setMedia(prev =>
      prev.map(item => (item.id === editingMemory.id ? editingMemory : item))
    )
    if (detailMemory && detailMemory.id === editingMemory.id) {
      setDetailMemory(editingMemory)
    }
    setEditingMemory(null)
    showToast('Đã cập nhật thông tin kỷ niệm.')
  }

  // Albums operations
  const handleAddAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!albumForm.name.trim()) return

    const newAlbum: AlbumItem = {
      id: `album-${Date.now()}`,
      name: albumForm.name.trim(),
      description: albumForm.description.trim() || null,
      cover_media_id: null,
      created_at: new Date().toISOString()
    }

    setAlbums(prev => [...prev, newAlbum])
    setShowAddAlbumModal(false)
    setAlbumForm({ name: '', description: '' })
    showToast(`Đã tạo album "${newAlbum.name}"`)
  }

  const handleUpdateAlbum = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAlbum) return

    setAlbums(prev =>
      prev.map(a => (a.id === editingAlbum.id ? editingAlbum : a))
    )
    setEditingAlbum(null)
    showToast('Đã cập nhật thông tin album.')
  }

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Bạn có muốn xóa album này? Ảnh trong album vẫn sẽ được giữ lại.')) return
    await deleteAlbumFromDB(albumId)
    setAlbums(prev => prev.filter(a => a.id !== albumId))
    setMedia(prev =>
      prev.map(m => (m.album_id === albumId ? { ...m, album_id: null } : m))
    )
    if (selectedAlbumId === albumId) setSelectedAlbumId(null)
    showToast('Đã xóa album.')
  }

  // Next / Prev in Detail Lightbox
  const handlePrevDetail = () => {
    if (!detailMemory) return
    const curIdx = filtered.findIndex(x => x.id === detailMemory.id)
    if (curIdx > 0) {
      setDetailMemory(filtered[curIdx - 1])
    } else {
      setDetailMemory(filtered[filtered.length - 1])
    }
  }

  const handleNextDetail = () => {
    if (!detailMemory) return
    const curIdx = filtered.findIndex(x => x.id === detailMemory.id)
    if (curIdx < filtered.length - 1) {
      setDetailMemory(filtered[curIdx + 1])
    } else {
      setDetailMemory(filtered[0])
    }
  }

  // Export / Backup data
  const handleExportData = () => {
    const backup = {
      user,
      media,
      albums,
      export_date: new Date().toISOString(),
      app: 'My Memories v2.0'
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mymemories-backup-${user.name || 'user'}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Đã xuất bản sao lưu kỷ niệm (JSON) về máy của bạn!')
  }

  // Import / Restore data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (Array.isArray(parsed.media)) {
          setMedia(parsed.media)
          await saveAllMediaToDB(parsed.media, user.email)
        }
        if (Array.isArray(parsed.albums)) {
          setAlbums(parsed.albums)
          await saveAllAlbumsToDB(parsed.albums, user.email)
        }
        if (parsed.user) {
          setUser(parsed.user)
        }
        showToast('Đã khôi phục dữ liệu kỷ niệm thành công!')
      } catch (err) {
        console.error(err)
        showToast('Tệp sao lưu không hợp lệ. Vui lòng kiểm tra lại.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Download image file
  const handleDownloadImage = (item: MediaItem) => {
    const a = document.createElement('a')
    a.href = item.storage_key
    a.download = `${item.title || item.file_name}.jpg`
    a.target = '_blank'
    a.click()
    showToast('Bắt đầu tải xuống hình ảnh...')
  }

  // Navigation Items
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'media', label: 'Tất cả ảnh', icon: Camera },
    { id: 'albums', label: 'Album kỷ niệm', icon: FolderOpen },
    { id: 'favorites', label: 'Mục yêu thích', icon: Star },
    { id: 'timeline', label: 'Dòng thời gian', icon: Heart },
    { id: 'ai', label: 'AI Tìm kiếm', icon: Sparkles },
    { id: 'settings', label: 'Cài đặt & Sao lưu', icon: Settings }
  ] as const

  const currentAlbum = albums.find(a => a.id === selectedAlbumId)
  const displayName = user?.name || 'Thanh Yến'

  return (
    <div className="app-shell">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Heart size={18} fill="currentColor" />
          </div>
          <div className="brand-text">
            <span>MY MEMORIES</span>
            <small>Ký ức của {displayName}</small>
          </div>
        </div>

        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(id)
                setSelectedTag(null)
                setSelectedYear(null)
                if (id !== 'albums') setSelectedAlbumId(null)
                setMobileMenuOpen(false)
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === 'favorites' && media.filter(m => m.is_favorite).length > 0 && (
                <span className="badge">{media.filter(m => m.is_favorite).length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="primary add-btn-sidebar" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Thêm kỷ niệm mới
          </button>

          <div className="user-profile-badge" onClick={() => setShowAuthModal(true)}>
            <div className="avatar">{displayName[0]?.toUpperCase() || 'Y'}</div>
            <div className="user-info">
              <strong>{displayName}</strong>
              <span>{user?.email}</span>
            </div>
            <Edit2 size={13} className="edit-ico" />
          </div>

          <div className="security-note">
            <Check size={14} />
            <span>
              Lưu trữ an toàn & riêng tư
              <br />
              <small>IndexedDB + Bản sao lưu cục bộ</small>
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content">
        {/* Header */}
        <header>
          <div className="header-left">
            <button
              className="menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Mở thanh điều hướng"
            >
              <Menu size={22} />
            </button>
            <div className="breadcrumbs">
              <span>Không gian của</span> <strong>{displayName}</strong>
              {activeTab !== 'home' && (
                <span className="crumb-page"> / {navItems.find(n => n.id === activeTab)?.label}</span>
              )}
              {selectedAlbumId && currentAlbum && (
                <span className="crumb-page"> / {currentAlbum.name}</span>
              )}
            </div>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <Search size={15} />
              <input
                placeholder="Tìm ký ức, địa điểm, thẻ…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="clear-search"
                  onClick={() => setQuery('')}
                  title="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              className="primary header-add-btn"
              onClick={() => setShowAddModal(true)}
              title="Thêm kỷ niệm mới"
            >
              <Plus size={16} />
              <span className="btn-label">Thêm kỷ niệm</span>
            </button>
          </div>
        </header>

        {/* --- VIEW: HOME --- */}
        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <section className="hero">
              <div className="hero-text">
                <p className="eyebrow">KHOẢNH KHẮC CỦA RIÊNG BẠN</p>
                <h1>
                  Những điều
                  <br />
                  <em>đáng nhớ nhất.</em>
                </h1>
                <p className="hero-copy">
                  Ghi lại từng bức ảnh, cảm xúc và chuyến đi theo cách tự nhiên nhất.
                  Mọi khoảnh khắc của bạn đều được gìn giữ vẹn nguyên.
                </p>
                <div className="hero-cta-group">
                  <button className="primary" onClick={() => setShowAddModal(true)}>
                    <Upload size={16} /> Tải ảnh / Kỷ niệm
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      setActiveTab('albums')
                    }}
                  >
                    <FolderOpen size={16} /> Xem bộ sưu tập
                  </button>
                </div>
              </div>

              <div className="hero-art">
                <div className="polaroid polaroid-back">
                  <img
                    src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=85"
                    alt="kỷ niệm xưa"
                  />
                  <span>Đà Lạt mùa thông</span>
                </div>
                <div className="polaroid polaroid-front">
                  <img
                    src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85"
                    alt="chiều bình yên"
                  />
                  <span>Chiều bình yên</span>
                </div>
              </div>
            </section>

            {/* Quick Filter Bar */}
            <section className="section-head">
              <div>
                <p className="eyebrow">THƯ VIỆN GẦN ĐÂY</p>
                <h2>Khoảnh khắc của bạn</h2>
              </div>
              <div className="head-tools">
                <span className="count">{filtered.length} khoảnh khắc</span>
              </div>
            </section>

            {/* Filter Tags & Years */}
            <div className="filter-scroll-container">
              <div className="tag-bar">
                <button
                  className={`tag-chip ${selectedTag === null && selectedYear === null ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTag(null)
                    setSelectedYear(null)
                  }}
                >
                  Tất cả ({media.length})
                </button>

                {allYears.map(year => (
                  <button
                    key={year}
                    className={`tag-chip year-chip ${selectedYear === year ? 'active' : ''}`}
                    onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                  >
                    📅 Năm {year}
                  </button>
                ))}

                {allTags.slice(0, 7).map(tag => (
                  <button
                    key={tag}
                    className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Grid */}
            <div className="memory-grid">
              {filtered.map(item => (
                <article
                  className="memory-card"
                  key={item.id}
                  onClick={() => setDetailMemory(item)}
                >
                  <div className="memory-image">
                    <img src={item.storage_key} alt={item.title ?? item.file_name} loading="lazy" />
                    <button
                      className={`favorite ${item.is_favorite ? 'active' : ''}`}
                      onClick={e => toggleFavorite(item.id, e)}
                      title={item.is_favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                    >
                      <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                    {item.location && (
                      <div className="photo-location-pill">
                        📍 {item.location}
                      </div>
                    )}
                  </div>
                  <div className="memory-info">
                    <div>
                      <h3>{item.title ?? item.file_name}</h3>
                      <p>{item.taken_at || 'Không ghi ngày'}</p>
                    </div>
                    {item.album_id && (
                      <span className="album-indicator" title="Nằm trong Album">
                        <FolderOpen size={13} />
                      </span>
                    )}
                  </div>
                </article>
              ))}

              {filtered.length === 0 && (
                <div className="empty">
                  <Camera size={38} className="empty-icon" />
                  <h3>Chưa tìm thấy kỷ niệm nào phù hợp</h3>
                  <p>Hãy thử xóa từ khóa tìm kiếm hoặc nhấn nút "Thêm kỷ niệm" để lưu ảnh đầu tiên.</p>
                  <button className="primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Thêm kỷ niệm ngay
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Panels */}
            <section className="bottom-panels">
              <div className="panel on-this-day-panel">
                <div className="panel-icon">
                  <Heart size={18} fill="currentColor" />
                </div>
                <div>
                  <p className="eyebrow">NGÀY NÀY NĂM XƯA</p>
                  <h3>Kỷ niệm hôm nay</h3>
                  <p>
                    {todayMemories.length > 0
                      ? `Có ${todayMemories.length} bức ảnh được chụp vào ngày này các năm trước đang chờ bạn khám phá lại.`
                      : 'Lưu giữ những khoảnh khắc đẹp ngày hôm nay để xem lại vào đúng ngày này các năm tiếp theo.'}
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setActiveTab('timeline')
                  }}
                >
                  Xem dòng thời gian →
                </button>
              </div>

              <div className="panel ai-panel">
                <div className="panel-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="eyebrow">TÌM KIẾM CẢM XÚC</p>
                  <h3>AI Tìm kiếm thông minh</h3>
                  <p>Tìm lại ảnh theo tâm trạng, cảnh vật: “Đà Lạt”, “hoàng hôn”, “cà phê”, “Hội An”.</p>
                </div>
                <button
                  className="text-button ai-link"
                  onClick={() => {
                    setActiveTab('ai')
                  }}
                >
                  Khám phá AI →
                </button>
              </div>
            </section>
          </>
        )}

        {/* --- VIEW: ALL MEDIA --- */}
        {activeTab === 'media' && (
          <div>
            <section className="section-head">
              <div>
                <p className="eyebrow">THƯ VIỆN HÌNH ẢNH</p>
                <h2>Tất cả ảnh & Kỷ niệm</h2>
              </div>
              <button className="primary" onClick={() => setShowAddModal(true)}>
                <Upload size={16} /> Thêm ảnh mới
              </button>
            </section>

            <div className="tag-bar">
              <button
                className={`tag-chip ${selectedTag === null ? 'active' : ''}`}
                onClick={() => setSelectedTag(null)}
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
            </div>

            <div className="memory-grid">
              {filtered.map(item => (
                <article
                  className="memory-card"
                  key={item.id}
                  onClick={() => setDetailMemory(item)}
                >
                  <div className="memory-image">
                    <img src={item.storage_key} alt={item.title ?? item.file_name} loading="lazy" />
                    <button
                      className={`favorite ${item.is_favorite ? 'active' : ''}`}
                      onClick={e => toggleFavorite(item.id, e)}
                    >
                      <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                    {item.location && (
                      <div className="photo-location-pill">📍 {item.location}</div>
                    )}
                  </div>
                  <div className="memory-info">
                    <div>
                      <h3>{item.title ?? item.file_name}</h3>
                      <p>{item.taken_at}</p>
                    </div>
                  </div>
                </article>
              ))}
              {filtered.length === 0 && (
                <div className="empty">Thư viện hiện chưa có hình ảnh nào.</div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: ALBUMS --- */}
        {activeTab === 'albums' && (
          <div>
            <section className="section-head">
              <div>
                <p className="eyebrow">BỘ SƯU TẬP</p>
                <h2>{selectedAlbumId ? currentAlbum?.name : 'Album kỷ niệm'}</h2>
              </div>
              <div className="album-head-actions">
                {selectedAlbumId ? (
                  <>
                    <button
                      className="secondary"
                      onClick={() => setSelectedAlbumId(null)}
                    >
                      ← Quay lại tất cả Album
                    </button>
                    <button
                      className="secondary"
                      onClick={() => currentAlbum && setEditingAlbum(currentAlbum)}
                    >
                      <Edit2 size={15} /> Sửa Album
                    </button>
                    <button
                      className="secondary delete-btn"
                      onClick={() => handleDeleteAlbum(selectedAlbumId)}
                    >
                      <Trash2 size={15} /> Xóa Album
                    </button>
                  </>
                ) : (
                  <button className="primary" onClick={() => setShowAddAlbumModal(true)}>
                    <FolderPlus size={16} /> Tạo Album mới
                  </button>
                )}
              </div>
            </section>

            {!selectedAlbumId ? (
              <div className="album-grid">
                {albums.map(album => {
                  const albumMedia = media.filter(m => m.album_id === album.id)
                  const cover = albumMedia[0]?.storage_key
                  return (
                    <div
                      key={album.id}
                      className="album-card"
                      onClick={() => setSelectedAlbumId(album.id)}
                    >
                      <div className="album-cover">
                        {cover ? (
                          <img src={cover} alt={album.name} />
                        ) : (
                          <div className="album-empty-cover">
                            <FolderOpen size={42} color="#998" />
                          </div>
                        )}
                        <span className="album-badge">{albumMedia.length} ảnh</span>
                      </div>
                      <div className="album-info">
                        <h3>{album.name}</h3>
                        <p>{album.description || 'Chưa có mô tả'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div>
                {currentAlbum?.description && (
                  <p className="album-desc-banner">{currentAlbum.description}</p>
                )}

                <div className="memory-grid">
                  {filtered.map(item => (
                    <article
                      className="memory-card"
                      key={item.id}
                      onClick={() => setDetailMemory(item)}
                    >
                      <div className="memory-image">
                        <img src={item.storage_key} alt={item.title ?? item.file_name} />
                        <button
                          className={`favorite ${item.is_favorite ? 'active' : ''}`}
                          onClick={e => toggleFavorite(item.id, e)}
                        >
                          <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="memory-info">
                        <div>
                          <h3>{item.title ?? item.file_name}</h3>
                          <p>{item.taken_at}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                  {filtered.length === 0 && (
                    <div className="empty">
                      Album này chưa có ảnh. Hãy sửa một kỷ niệm bất kỳ và chọn album này!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: FAVORITES --- */}
        {activeTab === 'favorites' && (
          <div>
            <section className="section-head">
              <div>
                <p className="eyebrow">BỘ SƯU TẬP QUÝ GIÁ</p>
                <h2>Khoảnh khắc yêu thích</h2>
              </div>
              <span className="count">{filtered.length} yêu thích</span>
            </section>

            <div className="memory-grid">
              {filtered.map(item => (
                <article
                  className="memory-card"
                  key={item.id}
                  onClick={() => setDetailMemory(item)}
                >
                  <div className="memory-image">
                    <img src={item.storage_key} alt={item.title ?? item.file_name} />
                    <button
                      className="favorite active"
                      onClick={e => toggleFavorite(item.id, e)}
                      title="Bỏ yêu thích"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </div>
                  <div className="memory-info">
                    <div>
                      <h3>{item.title ?? item.file_name}</h3>
                      <p>{item.taken_at}</p>
                    </div>
                  </div>
                </article>
              ))}
              {filtered.length === 0 && (
                <div className="empty">
                  <Star size={36} className="empty-icon" />
                  <h3>Chưa có kỷ niệm nào được ghim Yêu thích</h3>
                  <p>Nhấp vào biểu tượng trái tim trên bất kỳ bức ảnh nào để ghim lại đây.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: TIMELINE --- */}
        {activeTab === 'timeline' && (
          <div>
            <section className="section-head">
              <div>
                <p className="eyebrow">DÒNG THỜI GIAN</p>
                <h2>Ký ức theo năm tháng</h2>
              </div>
            </section>

            <div className="timeline-list">
              {media
                .slice()
                .sort((a, b) => (b.taken_at || '').localeCompare(a.taken_at || ''))
                .map(item => (
                  <div
                    className="timeline-item"
                    key={item.id}
                    onClick={() => setDetailMemory(item)}
                  >
                    <img
                      className="timeline-thumb"
                      src={item.storage_key}
                      alt={item.title || item.file_name}
                    />
                    <div className="timeline-content">
                      <div className="timeline-date">
                        📅 {item.taken_at || 'Chưa rõ ngày'}
                        {item.location && <span> • 📍 {item.location}</span>}
                      </div>
                      <h3>{item.title || item.file_name}</h3>
                      {item.description && <p>{item.description}</p>}
                      {item.ai_tags && item.ai_tags.length > 0 && (
                        <div className="timeline-tags">
                          {item.ai_tags.map(t => (
                            <span key={t}>#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {media.length === 0 && (
                <div className="empty">Chưa có dữ liệu timeline.</div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: AI SEARCH --- */}
        {activeTab === 'ai' && (
          <div>
            <section className="section-head">
              <div>
                <p className="eyebrow">TRỢ LÝ KÝ ỨC</p>
                <h2>AI Tìm kiếm & Khám phá</h2>
              </div>
            </section>

            <div className="ai-search-container">
              <p className="ai-hint">
                Chọn từ khóa gợi ý để AI lọc nhanh các ký ức theo cảm xúc, phong cảnh và chủ đề:
              </p>
              <div className="tag-bar">
                {[
                  'Đà Lạt',
                  'Hoàng hôn',
                  'Cà phê',
                  'Bạn bè',
                  'Biển',
                  'Núi rừng',
                  'Sương sớm',
                  'Hội An',
                  'Hà Nội',
                  'Yên bình'
                ].map(term => (
                  <button
                    key={term}
                    className={`tag-chip ai-chip ${query === term ? 'active' : ''}`}
                    onClick={() => setQuery(query === term ? '' : term)}
                  >
                    ✨ {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="memory-grid">
              {filtered.map(item => (
                <article
                  className="memory-card"
                  key={item.id}
                  onClick={() => setDetailMemory(item)}
                >
                  <div className="memory-image">
                    <img src={item.storage_key} alt={item.title ?? item.file_name} />
                    <button
                      className={`favorite ${item.is_favorite ? 'active' : ''}`}
                      onClick={e => toggleFavorite(item.id, e)}
                    >
                      <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="memory-info">
                    <div>
                      <h3>{item.title ?? item.file_name}</h3>
                      <p>{item.taken_at}</p>
                    </div>
                  </div>
                </article>
              ))}
              {filtered.length === 0 && (
                <div className="empty">
                  Không tìm thấy kỷ niệm nào tương ứng với từ khóa "{query}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: SETTINGS & BACKUP --- */}
        {activeTab === 'settings' && (
          <div>
            <section className="section-head">
              <div>
                <p className="eyebrow">CÀI ĐẶT & SAO LƯU</p>
                <h2>Không gian riêng tư</h2>
              </div>
            </section>

            <div className="settings-grid">
              {/* Account Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <User size={20} className="icon-gold" />
                  <div>
                    <p className="eyebrow">TÀI KHOẢN HIỆN TẠI</p>
                    <h3>{displayName}</h3>
                    <p className="sub-text">{user?.email || 's2thanhyens2@gmail.com'}</p>
                  </div>
                </div>
                <button
                  className="secondary full"
                  onClick={() => setShowAuthModal(true)}
                >
                  Đổi thông tin tài khoản
                </button>
              </div>

              {/* Export / Backup Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <FileDown size={20} className="icon-sage" />
                  <div>
                    <p className="eyebrow">SAO LƯU & XUẤT DỮ LIỆU</p>
                    <h3>Tải về bản sao lưu</h3>
                    <p className="sub-text">
                      Xuất toàn bộ ảnh, album và nhật ký thành tệp JSON để lưu trữ an toàn.
                    </p>
                  </div>
                </div>
                <button className="primary full" onClick={handleExportData}>
                  <Download size={16} /> Xuất bản sao lưu (.json)
                </button>
              </div>

              {/* Import / Restore Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <FileUp size={20} className="icon-accent" />
                  <div>
                    <p className="eyebrow">PHỤC HỒI DỮ LIỆU</p>
                    <h3>Nhập tệp sao lưu</h3>
                    <p className="sub-text">
                      Khôi phục toàn bộ kỷ niệm từ tệp sao lưu JSON trước đó.
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  ref={backupInputRef}
                  style={{ display: 'none' }}
                  accept=".json"
                  onChange={handleImportData}
                />
                <button
                  className="secondary full"
                  onClick={() => backupInputRef.current?.click()}
                >
                  <Upload size={16} /> Chọn tệp sao lưu JSON
                </button>
              </div>

              {/* Reset Demo Data Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <RotateCcw size={20} className="icon-warn" />
                  <div>
                    <p className="eyebrow">DỮ LIỆU MẪU BAN ĐẦU</p>
                    <h3>Khôi phục bộ ảnh mẫu</h3>
                    <p className="sub-text">
                      Khôi phục lại danh sách ảnh mẫu (Đà Lạt, Hoàng hôn, Bạn bè, Hội An).
                    </p>
                  </div>
                </div>
                <button
                  className="secondary full"
                  onClick={async () => {
                    if (confirm('Khôi phục bộ ảnh mẫu sẽ thêm lại các ảnh mặc định. Tiếp tục?')) {
                      setMedia(initialDemoMedia)
                      setAlbums(initialDemoAlbums)
                      await saveAllMediaToDB(initialDemoMedia, user.email)
                      await saveAllAlbumsToDB(initialDemoAlbums, user.email)
                      showToast('Đã khôi phục bộ ảnh mẫu ban đầu!')
                    }
                  }}
                >
                  Khôi phục dữ liệu mẫu
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS & OVERLAYS
      ========================================================================= */}

      {/* 1. ADD MEMORY MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowAddModal(false)}>
              <X size={20} />
            </button>
            <p className="eyebrow">THÊM KỶ NIỆM MỚI</p>
            <h2>Lưu giữ khoảnh khắc</h2>

            {/* Mode Switcher */}
            <div className="tab-pill-switcher">
              <button
                type="button"
                className={uploadMode === 'device' ? 'active' : ''}
                onClick={() => setUploadMode('device')}
              >
                <Upload size={15} /> Tải từ máy
              </button>
              <button
                type="button"
                className={uploadMode === 'preset' ? 'active' : ''}
                onClick={() => setUploadMode('preset')}
              >
                <Sparkles size={15} /> Ảnh mẫu đẹp
              </button>
              <button
                type="button"
                className={uploadMode === 'url' ? 'active' : ''}
                onClick={() => setUploadMode('url')}
              >
                <ImageIcon size={15} /> Link ảnh URL
              </button>
            </div>

            {/* MODE: DEVICE FILE UPLOAD */}
            {uploadMode === 'device' && (
              <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={e => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault()
                  setIsDragging(false)
                  handleFileUpload(e.dataTransfer.files)
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  multiple
                  onChange={e => handleFileUpload(e.target.files)}
                />
                <Upload size={32} className="dropzone-icon" />
                <p>
                  <strong>Nhấn để chọn ảnh</strong> hoặc kéo thả ảnh vào đây
                </p>
                <small>Hỗ trợ JPG, PNG, WEBP — Lưu trực tiếp an toàn</small>
                {isUploading && <p className="uploading-text">Đang nén & xử lý ảnh...</p>}

                {uploadedFiles.length > 0 && (
                  <div className="uploaded-preview-grid" onClick={e => e.stopPropagation()}>
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="preview-thumb">
                        <img src={file.url} alt={file.file_name} />
                        <button
                          type="button"
                          className="thumb-remove"
                          onClick={() => {
                            setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
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

            {/* MODE: PRESET SUGGESTIONS */}
            {uploadMode === 'preset' && (
              <div className="preset-container">
                <p className="sub-label">CHỌN MỘT KHOẢNH KHẮC MẪU:</p>
                <div className="preset-grid">
                  {presetOptions.map(p => (
                    <div
                      key={p.url}
                      className={`preset-card ${urlForm.url === p.url ? 'selected' : ''}`}
                      onClick={() => {
                        setUrlForm({
                          ...urlForm,
                          url: p.url,
                          title: p.title,
                          location: p.location,
                          tags: p.tags.join(', ')
                        })
                      }}
                    >
                      <img src={p.url} alt={p.title} />
                      <div className="preset-info">
                        <strong>{p.title}</strong>
                        <span>📍 {p.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODE: URL INPUT */}
            {uploadMode === 'url' && (
              <div className="url-input-container">
                <label>
                  Đường dẫn ảnh (URL) *
                  <input
                    required
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={urlForm.url}
                    onChange={e => setUrlForm({ ...urlForm, url: e.target.value })}
                  />
                </label>
                {urlForm.url && (
                  <div className="url-preview">
                    <img src={urlForm.url} alt="Xem trước" onError={() => {}} />
                  </div>
                )}
              </div>
            )}

            {/* Common Details Form */}
            <form onSubmit={handleAddMedia} className="modal-form">
              <label>
                Tên kỷ niệm *
                <input
                  required
                  placeholder="Ví dụ: Hoàng hôn trên biển, Ngày tốt nghiệp..."
                  value={urlForm.title}
                  onChange={e => setUrlForm({ ...urlForm, title: e.target.value })}
                />
              </label>

              <div className="form-row">
                <label>
                  Ngày chụp
                  <input
                    type="date"
                    value={urlForm.taken_at}
                    onChange={e => setUrlForm({ ...urlForm, taken_at: e.target.value })}
                  />
                </label>

                <label>
                  Địa điểm
                  <input
                    placeholder="Ví dụ: Đà Lạt, Hồ Gươm..."
                    value={urlForm.location}
                    onChange={e => setUrlForm({ ...urlForm, location: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Chọn Album
                  <select
                    value={urlForm.album_id}
                    onChange={e => setUrlForm({ ...urlForm, album_id: e.target.value })}
                  >
                    <option value="">(Không chọn album)</option>
                    {albums.map(a => (
                      <option key={a.id} value={a.id}>
                        📁 {a.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Thẻ phân loại (ngăn cách bằng dấu phẩy)
                  <input
                    placeholder="du lịch, bạn bè, hoàng hôn"
                    value={urlForm.tags}
                    onChange={e => setUrlForm({ ...urlForm, tags: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Cảm nghĩ / Ghi chú câu chuyện
                <textarea
                  rows={2}
                  placeholder="Ghi lại những cảm xúc đặc biệt về khoảnh khắc này..."
                  value={urlForm.description}
                  onChange={e => setUrlForm({ ...urlForm, description: e.target.value })}
                />
              </label>

              <button className="primary full" type="submit">
                Lưu vào bộ sưu tập <Check size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. DETAIL LIGHTBOX & SLIDESHOW MODAL */}
      {detailMemory && (
        <div className="modal-backdrop lightbox-backdrop" onClick={() => setDetailMemory(null)}>
          <div className="lightbox-modal" onClick={e => e.stopPropagation()}>
            <div className="lightbox-top-bar">
              <button
                className="lightbox-action-btn"
                onClick={() => setSlideshowActive(!slideshowActive)}
                title={slideshowActive ? 'Tạm dừng trình chiếu' : 'Trình chiếu ảnh'}
              >
                <Play size={16} fill={slideshowActive ? 'currentColor' : 'none'} />
                <span>{slideshowActive ? 'Dừng chiếu' : 'Trình chiếu'}</span>
              </button>

              <button
                className="lightbox-action-btn"
                onClick={() => handleDownloadImage(detailMemory)}
                title="Tải ảnh về máy"
              >
                <Download size={16} /> <span>Tải ảnh</span>
              </button>

              <button
                className="lightbox-action-btn"
                onClick={() => setEditingMemory(detailMemory)}
                title="Sửa thông tin"
              >
                <Edit2 size={16} /> <span>Chỉnh sửa</span>
              </button>

              <button
                className="close lightbox-close"
                onClick={() => {
                  setSlideshowActive(false)
                  setDetailMemory(null)
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Photo with Prev/Next buttons */}
            <div className="lightbox-photo-stage">
              <button
                className="lightbox-nav-btn prev"
                onClick={handlePrevDetail}
                title="Ảnh trước"
              >
                <ChevronLeft size={24} />
              </button>

              <img
                src={detailMemory.storage_key}
                alt={detailMemory.title || detailMemory.file_name}
                className="lightbox-image"
              />

              <button
                className="lightbox-nav-btn next"
                onClick={handleNextDetail}
                title="Ảnh tiếp theo"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Metadata Footer */}
            <div className="lightbox-info-pane">
              <div className="lightbox-title-row">
                <div>
                  <p className="eyebrow">
                    📅 {detailMemory.taken_at || 'KHOẢNH KHẮC'}
                    {detailMemory.location && ` • 📍 ${detailMemory.location}`}
                  </p>
                  <h2>{detailMemory.title || detailMemory.file_name}</h2>
                </div>

                <button
                  className={`favorite ${detailMemory.is_favorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(detailMemory.id)}
                  title="Yêu thích"
                >
                  <Heart size={20} fill={detailMemory.is_favorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              {detailMemory.description && (
                <p className="lightbox-caption">{detailMemory.description}</p>
              )}

              {detailMemory.ai_tags && detailMemory.ai_tags.length > 0 && (
                <div className="tag-bar lightbox-tags">
                  {detailMemory.ai_tags.map(t => (
                    <span key={t} className="tag-chip">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="lightbox-bottom-actions">
                <button
                  className="secondary delete-btn"
                  onClick={() => handleDeleteMemory(detailMemory.id)}
                >
                  <Trash2 size={15} /> Xóa kỷ niệm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EDIT MEMORY MODAL */}
      {editingMemory && (
        <div className="modal-backdrop" onClick={() => setEditingMemory(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setEditingMemory(null)}>
              <X size={20} />
            </button>
            <p className="eyebrow">CHỈNH SỬA KỶ NIỆM</p>
            <h2>Cập nhật thông tin</h2>

            <form onSubmit={handleUpdateMemory} className="modal-form">
              <label>
                Tên kỷ niệm
                <input
                  required
                  value={editingMemory.title || ''}
                  onChange={e =>
                    setEditingMemory({ ...editingMemory, title: e.target.value })
                  }
                />
              </label>

              <div className="form-row">
                <label>
                  Ngày chụp
                  <input
                    type="date"
                    value={editingMemory.taken_at || ''}
                    onChange={e =>
                      setEditingMemory({ ...editingMemory, taken_at: e.target.value })
                    }
                  />
                </label>

                <label>
                  Địa điểm
                  <input
                    value={editingMemory.location || ''}
                    onChange={e =>
                      setEditingMemory({ ...editingMemory, location: e.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                Album
                <select
                  value={editingMemory.album_id || ''}
                  onChange={e =>
                    setEditingMemory({ ...editingMemory, album_id: e.target.value || null })
                  }
                >
                  <option value="">(Không chọn album)</option>
                  {albums.map(a => (
                    <option key={a.id} value={a.id}>
                      📁 {a.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Thẻ chủ đề (cách nhau bởi dấu phẩy)
                <input
                  value={editingMemory.ai_tags?.join(', ') || ''}
                  onChange={e =>
                    setEditingMemory({
                      ...editingMemory,
                      ai_tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })
                  }
                />
              </label>

              <label>
                Cảm nghĩ / Ghi chú
                <textarea
                  rows={3}
                  value={editingMemory.description || ''}
                  onChange={e =>
                    setEditingMemory({ ...editingMemory, description: e.target.value })
                  }
                />
              </label>

              <button className="primary full" type="submit">
                Lưu thay đổi <Check size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD ALBUM MODAL */}
      {showAddAlbumModal && (
        <div className="modal-backdrop" onClick={() => setShowAddAlbumModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowAddAlbumModal(false)}>
              <X size={20} />
            </button>
            <p className="eyebrow">BỘ SƯU TẬP MỚI</p>
            <h2>Tạo Album Kỷ Niệm</h2>

            <form onSubmit={handleAddAlbum} className="modal-form">
              <label>
                Tên album *
                <input
                  required
                  placeholder="Ví dụ: Chuyến đi Phú Quốc, Sinh nhật 2024..."
                  value={albumForm.name}
                  onChange={e => setAlbumForm({ ...albumForm, name: e.target.value })}
                />
              </label>
              <label>
                Mô tả (tùy chọn)
                <textarea
                  rows={2}
                  placeholder="Tập hợp những khoảnh khắc đáng nhớ nhất..."
                  value={albumForm.description}
                  onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })}
                />
              </label>
              <button className="primary full" type="submit">
                Tạo Album mới <Check size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. EDIT ALBUM MODAL */}
      {editingAlbum && (
        <div className="modal-backdrop" onClick={() => setEditingAlbum(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setEditingAlbum(null)}>
              <X size={20} />
            </button>
            <p className="eyebrow">CHỈNH SỬA ALBUM</p>
            <h2>Thông tin Album</h2>

            <form onSubmit={handleUpdateAlbum} className="modal-form">
              <label>
                Tên album *
                <input
                  required
                  value={editingAlbum.name}
                  onChange={e => setEditingAlbum({ ...editingAlbum, name: e.target.value })}
                />
              </label>
              <label>
                Mô tả
                <textarea
                  rows={2}
                  value={editingAlbum.description || ''}
                  onChange={e => setEditingAlbum({ ...editingAlbum, description: e.target.value })}
                />
              </label>
              <button className="primary full" type="submit">
                Lưu cập nhật <Check size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. USER PROFILE / ACCOUNT SWITCHER MODAL */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowAuthModal(false)}>
              <X size={20} />
            </button>
            <p className="eyebrow">KHÔNG GIAN CÁ NHÂN</p>
            <h2>Hồ sơ của bạn</h2>
            <p className="modal-copy">
              Nhập email và tên của bạn. Mỗi email sở hữu một không gian lưu trữ kỷ niệm hoàn toàn riêng biệt.
            </p>

            <form
              onSubmit={e => {
                e.preventDefault()
                if (!authEmail.trim()) return
                const dName = authName.trim() || authEmail.split('@')[0]
                setUser({ id: `user-${Date.now()}`, email: authEmail.trim(), name: dName })
                setShowAuthModal(false)
                showToast(`Chào mừng đến với không gian của ${dName}!`)
              }}
              className="modal-form"
            >
              <label>
                Email tài khoản *
                <input
                  required
                  type="email"
                  placeholder="s2thanhyens2@gmail.com"
                  value={authEmail || user.email}
                  onChange={e => setAuthEmail(e.target.value)}
                />
              </label>
              <label>
                Tên hiển thị *
                <input
                  required
                  placeholder="Thanh Yến"
                  value={authName || user.name}
                  onChange={e => setAuthName(e.target.value)}
                />
              </label>
              <button className="primary full" type="submit">
                Lưu & Chuyển không gian <span>→</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notice Toast */}
      {notice && (
        <div className="toast" onClick={() => setNotice('')}>
          <span>{notice}</span>
          <X size={15} />
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
