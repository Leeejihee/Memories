import { useEffect, useMemo, useState } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'
import { Camera, Check, Film, FolderOpen, Heart, Home, LogOut, MapPin, Menu, Plus, Search, Settings, Sparkles, Star, X } from 'lucide-react'
import './styles.css'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://eoiwnbhjbtwqvtzsqanw.supabase.co'
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? 'sb_publishable_VOWMSEYZirDOsEIFRoh5UA_As3FSGZY'
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

type Media = { id: string; file_name: string; mime_type: string; source: string; storage_key: string; title: string | null; description: string | null; taken_at: string | null; ai_tags: string[] | null; created_at: string }
type Album = { id: string; name: string; cover_media_id: string | null; created_at: string }
type Playlist = { id: string; name: string; youtube_video_ids: string[] | null; created_at: string }

const demoMedia: Media[] = [
  { id: 'demo-1', file_name: 'dalat.jpg', mime_type: 'image/jpeg', source: 'external_url', storage_key: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85', title: 'Đà Lạt trong sương', description: null, taken_at: '2024-05-24', ai_tags: ['Đà Lạt', 'du lịch'], created_at: '2024-05-24' },
  { id: 'demo-2', file_name: 'sunset.jpg', mime_type: 'image/jpeg', source: 'external_url', storage_key: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85', title: 'Chiều bình yên', description: null, taken_at: '2024-06-02', ai_tags: ['hoàng hôn'], created_at: '2024-06-02' },
  { id: 'demo-3', file_name: 'friends.jpg', mime_type: 'image/jpeg', source: 'external_url', storage_key: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85', title: 'Ngày bên nhau', description: null, taken_at: '2023-08-30', ai_tags: ['bạn bè'], created_at: '2023-08-30' },
  { id: 'demo-4', file_name: 'coffee.jpg', mime_type: 'image/jpeg', source: 'external_url', storage_key: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85', title: 'Một tách cà phê', description: null, taken_at: '2023-09-14', ai_tags: ['cà phê'], created_at: '2023-09-14' },
]

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(!supabase)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [notice, setNotice] = useState('')
  const [media, setMedia] = useState<Media[]>(demoMedia)
  const [albums, setAlbums] = useState<Album[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [active, setActive] = useState('home')
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [urlForm, setUrlForm] = useState({ url: '', title: '', album: '' })

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => { if (session?.user) loadUserData(session.user.id) }, [session])

  async function loadUserData(userId: string) {
    if (!supabase) return
    const [m, a, p] = await Promise.all([
      supabase.from('media').select('id,file_name,mime_type,source,storage_key,title,description,taken_at,ai_tags,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(200),
      supabase.from('albums').select('id,name,cover_media_id,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
      supabase.from('playlists').select('id,name,youtube_video_ids,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    ])
    if (!m.error) setMedia(m.data ?? [])
    if (!a.error) setAlbums(a.data ?? [])
    if (!p.error) setPlaylists(p.data ?? [])
  }

  async function authenticate(e: React.FormEvent) {
    e.preventDefault(); setAuthError('')
    if (!supabase) { setAuthError('Thiếu cấu hình Supabase. Hãy tạo file .env từ .env.example.'); return }
    const result = authMode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password })
    if (result.error) setAuthError(result.error.message)
    else if (authMode === 'signup') setNotice('Đăng ký thành công. Nếu bật xác nhận email, hãy kiểm tra hộp thư của bạn.')
  }

  async function signOut() { await supabase?.auth.signOut(); setMedia(demoMedia); setAlbums([]); setPlaylists([]) }

  async function addUrl(e: React.FormEvent) {
    e.preventDefault(); if (!urlForm.url.trim()) return
    const draft = { file_name: urlForm.title || 'Kỷ niệm mới', mime_type: 'image/*', source: 'external_url', storage_key: urlForm.url.trim(), title: urlForm.title || null, description: null, taken_at: new Date().toISOString(), ai_tags: [], user_id: session!.user.id }
    if (!supabase) return
    const { data, error } = await supabase.from('media').insert(draft).select('id,file_name,mime_type,source,storage_key,title,description,taken_at,ai_tags,created_at').single()
    if (error) setNotice(error.message); else if (data) { setMedia([data, ...media]); setNotice('Đã thêm kỷ niệm vào không gian riêng của bạn.'); setShowAdd(false); setUrlForm({ url: '', title: '', album: '' }) }
  }

  const filtered = useMemo(() => media.filter(item => [item.title, item.file_name, item.description, ...(item.ai_tags ?? [])].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())), [media, query])
  const displayName = session?.user.email?.split('@')[0] ?? 'khách'
  if (!authReady) return <div className="loading">Đang mở không gian kỷ niệm…</div>
  if (!session) return <AuthScreen mode={authMode} setMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={authError} notice={notice} onSubmit={authenticate} />

  const navItems = [['home', 'Trang chủ', Home], ['media', 'Hình ảnh', Camera], ['videos', 'Video', Film], ['albums', 'Album', FolderOpen], ['favorites', 'Yêu thích', Star], ['timeline', 'Timeline', Heart], ['places', 'Địa điểm', MapPin], ['ai', 'AI tìm kiếm', Sparkles], ['settings', 'Cài đặt', Settings]] as const
  return <div className="app-shell">
    <aside className={mobileMenu ? 'sidebar open' : 'sidebar'}><div className="brand"><div className="brand-mark"><Heart size={19} fill="currentColor" /></div><span>MY MEMORIES</span></div><nav>{navItems.map(([id, label, Icon]) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(id); setMobileMenu(false) }}><Icon size={18} /><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><div className="security-note"><Check size={15} /><span>Dữ liệu riêng tư<br /><small>Chỉ mình bạn truy cập</small></span></div><button className="nav-item" onClick={signOut}><LogOut size={18} /><span>Đăng xuất</span></button></div></aside>
    <main className="content"><header><button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button><div className="breadcrumbs">Không gian của <strong>{displayName}</strong></div><div className="header-actions"><div className="search-box"><Search size={17} /><input placeholder="Tìm kỷ niệm…" value={query} onChange={e => setQuery(e.target.value)} /></div><div className="avatar">{displayName[0].toUpperCase()}</div></div></header>
      <section className="hero"><div><p className="eyebrow">KHOẢNH KHẮC CỦA RIÊNG BẠN</p><h1>Những điều<br /><em>đáng nhớ.</em></h1><p className="hero-copy">Lưu giữ những khoảnh khắc quan trọng và tìm lại chúng theo cách thật tự nhiên.</p><button className="primary" onClick={() => setShowAdd(true)}><Plus size={18} /> Thêm kỷ niệm</button></div><div className="hero-art"><div className="polaroid polaroid-back"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=85" /></div><div className="polaroid polaroid-front"><img src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=700&q=85" /><span>một ngày rất đẹp</span></div></div></section>
      <section className="section-head"><div><p className="eyebrow">THƯ VIỆN CỦA BẠN</p><h2>{active === 'home' ? 'Kỷ niệm gần đây' : navItems.find(x => x[0] === active)?.[1]}</h2></div><span className="count">{filtered.length} khoảnh khắc</span></section>
      <div className="memory-grid">{filtered.map(item => <article className="memory-card" key={item.id}><div className="memory-image"><img src={item.storage_key} alt={item.title ?? item.file_name} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} /><button className="favorite"><Heart size={17} /></button></div><div className="memory-info"><div><h3>{item.title ?? item.file_name}</h3><p>{item.taken_at ? new Date(item.taken_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Chưa có ngày'}</p></div><span className="source-dot" title={item.source} /></div></article>)}{filtered.length === 0 && <div className="empty">Chưa có dữ liệu phù hợp. Hãy thêm kỷ niệm đầu tiên của bạn.</div>}</div>
      <section className="bottom-panels"><div className="panel"><div className="panel-icon"><Heart size={19} fill="currentColor" /></div><div><p className="eyebrow">KỶ NIỆM HÔM NAY</p><h3>Ngày này những năm trước</h3><p>{media.filter(x => x.taken_at?.slice(5) === new Date().toISOString().slice(5, 10)).length} khoảnh khắc đang chờ bạn mở lại.</p></div><button className="text-button" onClick={() => setActive('timeline')}>Xem tất cả →</button></div><div className="panel ai-panel"><div className="panel-icon"><Sparkles size={19} /></div><div><p className="eyebrow">TÌM KIẾM THÔNG MINH</p><h3>Hỏi về ký ức của bạn</h3><p>Thử tìm “Đà Lạt năm 2024” hoặc “ảnh có hoàng hôn”.</p></div></div></section>
    </main>
    {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowAdd(false)}><X /></button><p className="eyebrow">THÊM NGUỒN KỶ NIỆM</p><h2>Đưa một khoảnh khắc<br />vào không gian riêng.</h2><p className="modal-copy">Hiện tại bạn có thể thêm ảnh bằng URL trực tiếp. Dữ liệu được gắn với tài khoản đang đăng nhập.</p><form onSubmit={addUrl}><label>URL hình ảnh<input required type="url" placeholder="https://…/photo.jpg" value={urlForm.url} onChange={e => setUrlForm({ ...urlForm, url: e.target.value })} /></label><label>Tên kỷ niệm<input placeholder="Ví dụ: Đà Lạt 2024" value={urlForm.title} onChange={e => setUrlForm({ ...urlForm, title: e.target.value })} /></label><button className="primary full" type="submit">Lưu vào thư viện <Check size={17} /></button></form></div></div>}
    {notice && <button className="toast" onClick={() => setNotice('')}>{notice}<X size={15} /></button>}
  </div>
}

function AuthScreen({ mode, setMode, email, setEmail, password, setPassword, error, notice, onSubmit }: any) { return <div className="auth-page"><div className="auth-art"><div className="auth-copy"><div className="brand"><div className="brand-mark"><Heart size={19} fill="currentColor" /></div><span>MY MEMORIES</span></div><h1>Nơi những<br /><em>khoảnh khắc</em><br />ở lại.</h1><p>Một không gian riêng tư để lưu giữ, sắp xếp và tìm lại những điều bạn yêu thương.</p></div></div><div className="auth-card"><div className="auth-form"><p className="eyebrow">CHÀO MỪNG TRỞ LẠI</p><h2>{mode === 'login' ? 'Mở lại ký ức của bạn' : 'Tạo không gian riêng'}</h2><p className="auth-sub">{mode === 'login' ? 'Đăng nhập để tiếp tục hành trình.' : 'Mỗi tài khoản có một thư viện hoàn toàn riêng biệt.'}</p><form onSubmit={onSubmit}><label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Mật khẩu<input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" /></label>{error && <div className="error">{error}</div>}{notice && <div className="success">{notice}</div>}<button className="primary full" type="submit">{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'} <span>→</span></button></form><p className="switch-auth">{mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Tạo tài khoản' : 'Đăng nhập'}</button></p></div></div></div> }

export default App
