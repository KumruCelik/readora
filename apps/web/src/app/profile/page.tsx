'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'
import { useBookSearch } from '@/components/BookSearchModal'

interface User {
  id: string
  username: string
  bio: string | null
  avatar: string | null
  createdAt: string
  _count: {
    userBooks: number
    reviews: number
    followers: number
    following: number
  }
}

interface Stats {
  totalBooks: number
  readBooks: number
  reviews: number
  topGenre: string | null
}

interface Shelf {
  id: string
  name: string
  isDefault: boolean
  shelfBooks: { id: string }[]
}

interface GenreCount {
  genre: string
  count: number
}

const shelfIcons: Record<string, string> = {
  'Okunacak': '🔖',
  'Okunuyor': '📖',
  'Okundu': '✅',
}

export default function ProfilePage() {
  const router = useRouter()
  const { openSearch } = useBookSearch()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [topGenres, setTopGenres] = useState<GenreCount[]>([])
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [newShelfName, setNewShelfName] = useState('')
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(true)
  const [profileUsername, setProfileUsername] = useState<string | null>(null)

  const fetchShelves = useCallback(async (userId: string) => {
    try {
      const res = await api.get(`/shelves/user/${userId}`)
      setShelves(res.data.data)
    } catch { /* ignore */ }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const [meRes, statsRes, detailedRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/users/stats'),
        api.get('/users/detailed-stats').catch(() => null),
      ])
      setUser(meRes.data.data)
      setStats(statsRes.data.data)
      if (detailedRes) setTopGenres(detailedRes.data.data.topGenres || [])
      await fetchShelves(meRes.data.data.id)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router, fetchShelves])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }
    fetchProfile().then(() => {
      const urlUsername = window.location.pathname.split('/').pop()
      if (urlUsername && urlUsername !== 'profile') {
        setProfileUsername(urlUsername)
      }
    })
  }, [fetchProfile, router])

  useEffect(() => {
    if (!profileUsername || !user) return
    if (profileUsername !== user.username) {
      setIsOwnProfile(false)
      api.get(`/users/${profileUsername}/is-following`)
        .then(res => setIsFollowing(res.data.data.following))
        .catch(() => {})
    }
  }, [profileUsername, user])

  async function createShelf(e: React.FormEvent) {
    e.preventDefault()
    if (!newShelfName.trim() || !user) return
    try {
      await api.post('/shelves', { name: newShelfName })
      setNewShelfName('')
      fetchShelves(user.id)
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteShelf(shelfId: string) {
    if (!user) return
    try {
      await api.delete(`/shelves/${shelfId}`)
      fetchShelves(user.id)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
        <div style={{ textAlign: 'center', padding: 60, color: '#9DB5A4' }}>Yükleniyor...</div>
      </div>
    )
  }

  if (!user) return null

  const joinedLabel = new Date(user.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#faf9f6' }}>
      <main className="flex-1 max-w-desktop mx-auto px-4 md:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6">
            <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#446651' }}>
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.username} width={48} height={48} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'serif', fontWeight: 700, color: '#446651', fontSize: 16 }}>@{user.username}</h2>
                  <p style={{ fontSize: 12, color: '#9DB5A4' }}>{joinedLabel}&apos;den beri okur</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {shelves.map((shelf) => (
                  <div key={shelf.id} className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ color: '#424843', fontSize: 13, fontWeight: 500 }}>
                    <span>{shelfIcons[shelf.name] || '📁'}</span>
                    <span>{shelf.name}</span>
                    <span style={{ marginLeft: 'auto', color: '#9DB5A4', fontSize: 12 }}>{shelf.shelfBooks?.length || 0}</span>
                  </div>
                ))}
                <Link href="/stats" className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ color: '#424843', fontSize: 13, fontWeight: 500 }}>
                  <span>📊</span>
                  <span>İstatistiklerim</span>
                </Link>
                <Link href="/clubs" className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ color: '#424843', fontSize: 13, fontWeight: 500 }}>
                  <span>👥</span>
                  <span>Kulüplerim</span>
                </Link>
              </nav>
              <button onClick={openSearch} className="mt-4 block text-center w-full" style={{ border: '1px solid #446651', color: '#446651', borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 700, background: 'none', cursor: 'pointer' }}>
                Tüm Türleri Keşfet
              </button>
            </div>

            <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
              <h3 className="mb-3" style={{ fontSize: 12, fontWeight: 700, color: '#446651', letterSpacing: 1 }}>FAVORİ TÜRLER</h3>
              <div className="flex flex-wrap gap-2">
                {topGenres.length > 0 ? (
                  topGenres.map((g) => (
                    <span key={g.genre} className="px-3 py-1 rounded-full" style={{ backgroundColor: '#E8E4DB', color: '#6c5b4d', fontSize: 12, fontWeight: 600 }}>
                      {g.genre}
                    </span>
                  ))
                ) : stats?.topGenre ? (
                  <span className="px-3 py-1 rounded-full" style={{ backgroundColor: '#E8E4DB', color: '#6c5b4d', fontSize: 12, fontWeight: 600 }}>
                    {stats.topGenre}
                  </span>
                ) : (
                  <p style={{ fontSize: 12, color: '#9DB5A4' }}>Henüz okuma verisi yok.</p>
                )}
              </div>
            </div>
          </aside>

          {/* Middle Column */}
          <div className="lg:col-span-6 flex flex-col gap-8">

            {/* Header */}
            <section className="flex flex-col md:flex-row gap-5 items-start">
              <div className="rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 128, height: 176, backgroundColor: '#EEF2EC', border: '1px solid #e8e8e5' }}>
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.username} width={128} height={176} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                ) : (
                  <span style={{ fontSize: 48 }}>📖</span>
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-baseline gap-3">
                  <h1 style={{ fontFamily: 'serif', fontSize: 26, fontWeight: 700, color: '#446651' }}>@{user.username}</h1>
                  {!isOwnProfile && (
                    <button
                      onClick={async () => {
                        const res = await api.post(`/users/${profileUsername}/follow`)
                        setIsFollowing(res.data.data.following)
                      }}
                      style={{
                        backgroundColor: isFollowing ? 'white' : '#446651',
                        color: isFollowing ? '#446651' : 'white',
                        border: '2px solid #446651',
                        borderRadius: 999, padding: '6px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 14, color: '#424843', marginTop: 4 }}>
                  {user.bio || 'Henüz bir biyografi eklenmemiş.'}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4 py-3" style={{ borderTop: '1px solid #e8e8e5', borderBottom: '1px solid #e8e8e5' }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#9DB5A4', textTransform: 'uppercase', letterSpacing: 1 }}>Takip</p>
                    <p style={{ fontSize: 14, color: '#2D2D2D' }}>{user._count?.followers ?? 0} takipçi • {user._count?.following ?? 0} takip</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#9DB5A4', textTransform: 'uppercase', letterSpacing: 1 }}>Üyelik</p>
                    <p style={{ fontSize: 14, color: '#2D2D2D' }}>{joinedLabel}&apos;de katıldı</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-4 items-center" style={{ fontSize: 12, color: '#9DB5A4' }}>
                  <span>{user._count?.reviews ?? 0} değerlendirme</span>
                  <Link href="/stats" style={{ color: '#446651', fontWeight: 700 }}>İstatistiklerim →</Link>
                </div>
              </div>
            </section>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Toplam Kitap', value: stats.totalBooks, emoji: '📚' },
                  { label: 'Okunan', value: stats.readBooks, emoji: '✅' },
                  { label: 'Yorum', value: stats.reviews, emoji: '💬' },
                  { label: 'Favori Tür', value: stats.topGenre || '—', emoji: '🏷️' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
                    <div className="text-2xl mb-1">{s.emoji}</div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#2D2D2D' }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: '#9DB5A4' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Book Shelves */}
            <section>
              <h3 className="mb-4 pb-2" style={{ fontSize: 12, fontWeight: 700, color: '#9DB5A4', letterSpacing: 1, borderBottom: '1px solid #e8e8e5' }}>
                KİTAP RAFLARIM
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {shelves.map((shelf) => (
                  <div key={shelf.id} className="rounded-xl p-4 flex flex-col gap-1" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
                    <div className="flex justify-between items-start">
                      <span style={{ fontSize: 24 }}>{shelfIcons[shelf.name] || '📁'}</span>
                      {!shelf.isDefault && (
                        <button onClick={() => deleteShelf(shelf.id)} style={{ color: '#c1c8c1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                          ✕
                        </button>
                      )}
                    </div>
                    <p style={{ fontWeight: 700, color: '#2D2D2D', fontSize: 14 }}>{shelf.name}</p>
                    <p style={{ fontSize: 12, color: '#9DB5A4' }}>{shelf.shelfBooks?.length || 0} kitap</p>
                  </div>
                ))}
              </div>
              <form onSubmit={createShelf} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Yeni raf adı..."
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                  className="flex-1 focus:outline-none"
                  style={{ border: '1px solid #c1c8c1', borderRadius: 8, padding: '10px 14px', fontSize: 13, backgroundColor: 'white' }}
                />
                <button type="submit" style={{ backgroundColor: '#446651', color: 'white', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Raf Ekle
                </button>
              </form>
            </section>

            {/* Reading Challenge */}
            <ReadingGoalSection />

            {/* Quotes */}
            <section className="pb-2" style={{ borderBottom: '1px solid #e8e8e5' }}>
              <h3 className="mb-3 pb-2" style={{ fontSize: 12, fontWeight: 700, color: '#9DB5A4', letterSpacing: 1, borderBottom: '1px solid #e8e8e5' }}>
                SÖZLERİM
              </h3>
              <p style={{ fontSize: 13, color: '#9DB5A4', fontStyle: 'italic' }}>
                Henüz hiçbir alıntı eklemedin.
              </p>
            </section>

            {/* Updates */}
            <section>
              <h3 className="mb-3 pb-2" style={{ fontSize: 12, fontWeight: 700, color: '#9DB5A4', letterSpacing: 1, borderBottom: '1px solid #e8e8e5' }}>
                SON GÜNCELLEMELER
              </h3>
              <p style={{ fontSize: 13, color: '#9DB5A4' }}>
                Henüz bir güncelleme yok. Kitap okuyup raflarını güncelledikçe burada görünecek.
              </p>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="rounded-xl p-5" style={{ backgroundColor: '#446651', color: 'white' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: 0.7, marginBottom: 4 }}>KEŞFET</p>
              <h3 style={{ fontFamily: 'serif', fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
                Yeni okuma kulüplerine göz at
              </h3>
              <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 16 }}>
                Benzer zevklere sahip okurlarla bir araya gel ve birlikte okuyun.
              </p>
              <Link href="/clubs" style={{ backgroundColor: 'white', color: '#446651', borderRadius: 999, padding: '8px 18px', fontSize: 13, fontWeight: 700 }}>
                Kulüpleri Gör
              </Link>
            </div>

            <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
              <h3 className="mb-3 pb-2" style={{ fontSize: 12, fontWeight: 700, color: '#9DB5A4', letterSpacing: 1, borderBottom: '1px solid #e8e8e5' }}>
                {new Date().getFullYear()} KİTAP YILIN
              </h3>
              <div className="flex gap-3 items-start mb-3">
                <div className="w-12 h-16 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f2dcca' }}>
                  <span style={{ fontSize: 22 }}>📅</span>
                </div>
                <p style={{ fontSize: 12, color: '#9DB5A4', lineHeight: 1.6 }}>
                  Bu yıl okuduğun kitaplara ve okuma deneyimine dair özet istatistiklerin.
                </p>
              </div>
              <Link href="/stats" style={{ color: '#446651', fontSize: 13, fontWeight: 700 }}>
                İstatistiklerime Git →
              </Link>
            </div>

            <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
              <h3 className="mb-3 pb-2" style={{ fontSize: 12, fontWeight: 700, color: '#9DB5A4', letterSpacing: 1, borderBottom: '1px solid #e8e8e5' }}>
                TAKİPÇİLER
              </h3>
              <p style={{ fontSize: 13, color: '#2D2D2D', marginBottom: 4 }}>
                {user._count?.followers ?? 0} takipçi • {user._count?.following ?? 0} takip edilen
              </p>
              <p style={{ fontSize: 12, color: '#9DB5A4' }}>
                Yeni okurları takip ederek okuma akışında etkinliklerini gör.
              </p>
            </div>

            <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
              <h3 className="mb-3 pb-2" style={{ fontSize: 12, fontWeight: 700, color: '#9DB5A4', letterSpacing: 1, borderBottom: '1px solid #e8e8e5' }}>
                HIZLI ERİŞİM
              </h3>
              <div className="flex flex-col gap-2">
                <Link href="/lists" style={{ fontSize: 13, color: '#446651', fontWeight: 600 }}>Listelerim</Link>
                <button onClick={openSearch} className="text-left" style={{ fontSize: 13, color: '#446651', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Kitap Ara</button>
                <Link href="/clubs" style={{ fontSize: 13, color: '#446651', fontWeight: 600 }}>Kulüpler</Link>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}

function ReadingGoalSection() {
  const [goal, setGoal] = useState<number | null>(null)
  const [readCount, setReadCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [newGoal, setNewGoal] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoal()
  }, [])

  async function fetchGoal() {
    try {
      const res = await api.get('/users/reading-goal')
      const data = res.data.data
      setGoal(data.goal)
      setReadCount(data.readCount)
      setProgress(data.progress)
    } finally {
      setLoading(false)
    }
  }

  async function handleSetGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!newGoal) return
    try {
      await api.post('/users/reading-goal', { goal: parseInt(newGoal) })
      setGoal(parseInt(newGoal))
      setNewGoal('')
      fetchGoal()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return null

  return (
    <section>
      <h3 className="mb-4 pb-2" style={{ fontSize: 12, fontWeight: 700, color: '#9DB5A4', letterSpacing: 1, borderBottom: '1px solid #e8e8e5' }}>
        OKUMA HEDEFİM ({new Date().getFullYear()})
      </h3>
      <div className="rounded-xl p-4 flex gap-4 items-center" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
        <div className="rounded flex flex-col items-center justify-center flex-shrink-0" style={{ width: 64, height: 64, backgroundColor: '#446651', color: 'white' }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>{new Date().getFullYear()}</span>
          <span style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Okuma</span>
        </div>
        <div className="flex-1">
          {goal ? (
            <>
              <p style={{ fontSize: 13, color: '#2D2D2D' }}>
                Bu yıl <strong>{goal} kitap</strong> okumayı hedefliyorsun, şu ana kadar <strong>{readCount}</strong> tanesini bitirdin.
              </p>
              <div className="mt-2 w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: '#e9e8e5' }}>
                <div className="h-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: '#446651' }} />
              </div>
              <p style={{ fontSize: 12, color: '#9DB5A4', marginTop: 6 }}>
                %{progress} tamamlandı{progress >= 100 && ' 🎉 Hedefine ulaştın!'}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: '#9DB5A4' }}>Henüz bir okuma hedefi belirlemedin.</p>
          )}
        </div>
      </div>
      <form onSubmit={handleSetGoal} className="flex gap-2 mt-3">
        <input
          type="number"
          placeholder="Bu yıl kaç kitap okuyacaksın?"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          min={1}
          max={365}
          className="flex-1 focus:outline-none"
          style={{ border: '1px solid #c1c8c1', borderRadius: 8, padding: '10px 14px', fontSize: 13, backgroundColor: 'white' }}
        />
        <button type="submit" style={{ backgroundColor: '#446651', color: 'white', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {goal ? 'Güncelle' : 'Hedef Belirle'}
        </button>
      </form>
    </section>
  )
}
