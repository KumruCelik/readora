'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { useBookSearch } from '@/components/BookSearchModal'

interface FeedItem {
  type: 'review' | 'shelf'
  id: string
  user: { username: string; avatar: string | null }
  book: { id: string; title: string; coverUrl: string | null; authors: string[] }
  rating?: number
  content?: string
  status?: string
  createdAt: string
}

interface Recommendation {
  id: string | null
  title: string
  authors: string[]
  coverUrl: string | null
  avgRating: number
  genres: string[]
  reason: string
}

const statusLabel: Record<string, string> = {
  WANT_TO_READ: '📌 Okuyacağım listesine ekledi',
  READING:      '📖 Okumaya başladı',
  READ:         '✅ Okudu',
}

const popularLists = [
  { title: "2024'ün En İyi Yerli Romanları", books: 128, members: '2.4k' },
  { title: 'Nobel Ödüllü Eserler', books: 92, members: '5.1k' },
  { title: 'Yatmadan Önce Okunacaklar', books: 45, members: '840' },
]

const footerLinkStyle = { fontSize: 13, color: '#9DB5A4', cursor: 'pointer' }

export default function HomePage() {
  const { openSearch } = useBookSearch()
  const [feed, setFeed]                     = useState<FeedItem[]>([])
  const [loading, setLoading]               = useState(true)
  const [isLoggedIn, setIsLoggedIn]         = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [recsLoading, setRecsLoading]       = useState(false)
  const [recsMessage, setRecsMessage]       = useState('')

  const carouselRef   = useRef<HTMLDivElement>(null)
  const isDownRef     = useRef(false)
  const startXRef     = useRef(0)
  const scrollLeftRef = useRef(0)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(!!token)
    if (token) {
      fetchFeed()
      fetchRecommendations()
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchFeed() {
    try {
      const res = await api.get('/users/feed')
      setFeed(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecommendations() {
    setRecsLoading(true)
    try {
      const res = await api.get('/books/recommendations')
      setRecommendations(res.data.data)
      setRecsMessage(res.data.meta?.message || 'Sana özel öneriler')
    } catch (err) {
      console.error(err)
    } finally {
      setRecsLoading(false)
    }
  }

  function handleCarouselDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!carouselRef.current) return
    isDownRef.current = true
    startXRef.current = e.pageX - carouselRef.current.offsetLeft
    scrollLeftRef.current = carouselRef.current.scrollLeft
  }

  function handleCarouselLeaveOrUp() {
    isDownRef.current = false
  }

  function handleCarouselMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDownRef.current || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startXRef.current) * 2
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#faf9f6' }}>

      {!isLoggedIn ? (

        /* Giriş yapılmamış — Hero */
        <div className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h1 style={{ fontFamily: 'serif', fontSize: 32, fontWeight: 700, color: '#2D2D2D' }} className="mb-3">
              Readora&apos;ya Hoş Geldin
            </h1>
            <p className="text-gray-500 mb-8 text-lg">Kitaplarla yaşa. Oku, keşfet, paylaş.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/login"
                style={{ backgroundColor: '#7B9E87', color: 'white', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 15 }}>
                Ücretsiz Başla
              </Link>
              <Link href="/login"
                style={{ border: '2px solid #7B9E87', color: '#7B9E87', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 15 }}>
                Giriş Yap
              </Link>
            </div>

            {/* Özellikler */}
            <div className="grid grid-cols-3 gap-4 mt-16">
              {[
                { icon: '📖', title: 'Kitap Takibi', desc: 'Okuduklarını, okuyacaklarını takip et' },
                { icon: '⭐', title: 'Puan & Yorum', desc: 'Kitaplara puan ver, yorum yaz' },
                { icon: '👥', title: 'Sosyal', desc: 'Arkadaşlarını takip et, ne okuduklarını gör' },
              ].map(f => (
                <div key={f.title} style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, border: '1px solid #c1c8c1' }}>
                  <div style={{ fontSize: 28 }}>{f.icon}</div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#2D2D2D', marginTop: 8 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: '#9DB5A4', marginTop: 4, lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      ) : (

        <>
          <main className="max-w-desktop mx-auto px-4 md:px-8 py-8 md:py-12 w-full flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">

              {/* Ana İçerik */}
              <div className="flex flex-col gap-12">

                {/* Sana Özel Öneriler */}
                <section>
                  <div className="flex items-end justify-between mb-5">
                    <div>
                      <h2 style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#2D2D2D' }}>
                        ✨ Sana Özel
                      </h2>
                      <p style={{ fontSize: 13, color: '#9DB5A4', marginTop: 4 }}>
                        {recsMessage}
                      </p>
                    </div>
                    <button
                      onClick={fetchRecommendations}
                      disabled={recsLoading}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#446651', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span className={recsLoading ? 'inline-block animate-spin' : 'inline-block'}>🔄</span>
                      Yenile
                    </button>
                  </div>

                  {recsLoading ? (
                    <div className="hide-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flexShrink: 0, width: 160 }}>
                          <div style={{ width: 160, aspectRatio: '2/3', borderRadius: 8, backgroundColor: '#EEF2EC', marginBottom: 10 }} />
                          <div style={{ height: 12, backgroundColor: '#EEF2EC', borderRadius: 6, marginBottom: 6, width: '80%' }} />
                          <div style={{ height: 10, backgroundColor: '#EEF2EC', borderRadius: 6, width: '60%' }} />
                        </div>
                      ))}
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 24, textAlign: 'center', border: '1px solid #e8e8e5' }}>
                      <p style={{ fontSize: 14, color: '#9DB5A4' }}>
                        Kitap okudukça sana özel öneriler burada belirecek! 📚
                      </p>
                    </div>
                  ) : (
                    <div
                      ref={carouselRef}
                      className="hide-scrollbar"
                      style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, cursor: 'grab' }}
                      onMouseDown={handleCarouselDown}
                      onMouseLeave={handleCarouselLeaveOrUp}
                      onMouseUp={handleCarouselLeaveOrUp}
                      onMouseMove={handleCarouselMove}
                    >
                      {recommendations.map((rec, index) => (
                        <div
                          key={rec.id || index}
                          style={{ flexShrink: 0, width: 160, cursor: rec.id ? 'pointer' : 'default' }}
                          onClick={() => rec.id && window.location.assign(`/books/${rec.id}`)}
                        >
                          {/* Kapak */}
                          <div style={{
                            width: 160, aspectRatio: '2/3',
                            borderRadius: 8,
                            overflow: 'hidden',
                            backgroundColor: '#EEF2EC',
                            border: '1px solid #e8e8e5',
                            marginBottom: 10,
                            position: 'relative'
                          }}>
                            {rec.coverUrl ? (
                              <img
                                src={rec.coverUrl}
                                alt={rec.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>
                                📖
                              </div>
                            )}
                            {rec.avgRating > 0 && (
                              <div style={{
                                position: 'absolute', bottom: 6, right: 6,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                borderRadius: 8, padding: '2px 6px',
                                fontSize: 11, color: 'white', fontWeight: 700
                              }}>
                                ⭐ {rec.avgRating.toFixed(1)}
                              </div>
                            )}
                          </div>

                          {/* Tür rozeti */}
                          {rec.genres?.[0] && (
                            <span style={{
                              display: 'inline-block', backgroundColor: '#E8E4DB', color: '#6c5b4d',
                              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, marginBottom: 6
                            }}>
                              {rec.genres[0]}
                            </span>
                          )}

                          {/* Bilgi */}
                          <p style={{ fontFamily: 'serif', fontSize: 15, fontWeight: 700, color: '#2D2D2D', lineHeight: 1.3, marginBottom: 2 }}
                            className="line-clamp-1">
                            {rec.title}
                          </p>
                          <p style={{ fontSize: 12, color: '#9DB5A4', marginBottom: 6 }}
                            className="line-clamp-1">
                            {rec.authors?.[0]}
                          </p>
                          <p style={{ fontSize: 11, color: '#446651', lineHeight: 1.4, fontStyle: 'italic' }}
                            className="line-clamp-2">
                            {rec.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Aktivite Akışı */}
                <section>
                  <h2 style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#2D2D2D', marginBottom: 20 }}>
                    📰 Arkadaşlarının Aktiviteleri
                  </h2>

                  {loading ? (
                    <div className="flex justify-center py-20">
                      <div className="text-gray-400">Yükleniyor...</div>
                    </div>
                  ) : feed.length === 0 ? (
                    <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 32, textAlign: 'center', border: '1px solid #e8e8e5' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2D2D', marginBottom: 8 }}>
                        Henüz güncelleme yok
                      </h3>
                      <p style={{ fontSize: 14, color: '#9DB5A4', lineHeight: 1.7, marginBottom: 20 }}>
                        Arkadaşlarını takip ederek onların okuma güncellemelerini burada görebilirsin.
                      </p>
                      <button onClick={openSearch}
                        style={{ backgroundColor: '#7B9E87', color: 'white', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                        Kitap Keşfet
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {feed.map(item => (
                        <div key={`${item.type}-${item.id}`}
                          style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: '1px solid #e8e8e5' }}>

                          {/* Avatar */}
                          <div style={{
                            width: 48, height: 48, borderRadius: 24, overflow: 'hidden', flexShrink: 0,
                            backgroundColor: '#7B9E87', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: 18
                          }}>
                            {item.user.avatar ? (
                              <img src={item.user.avatar} alt={item.user.username}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              item.user.username.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, color: '#2D2D2D', lineHeight: 1.6 }}>
                              <span style={{ fontWeight: 700 }}>@{item.user.username}</span>{' '}
                              <span style={{ color: '#9DB5A4' }}>
                                {item.type === 'shelf'
                                  ? statusLabel[item.status!] || item.status
                                  : '⭐ bir yorum yazdı:'}
                              </span>{' '}
                              <span style={{ fontWeight: 700 }}>{item.book.title}</span>
                            </p>
                            <p style={{ fontSize: 12, color: '#c1c8c1', marginTop: 2, marginBottom: 12 }}>
                              {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                            </p>

                            <Link href={`/books/${item.book.id}`}>
                              <div style={{
                                backgroundColor: '#f4f3f1', borderRadius: 10, padding: 14,
                                border: '1px solid #e8e8e5', display: 'flex', gap: 14
                              }}>
                                <div style={{ width: 56, height: 80, borderRadius: 6, overflow: 'hidden', backgroundColor: '#EEF2EC', flexShrink: 0 }}>
                                  {item.book.coverUrl ? (
                                    <img src={item.book.coverUrl} alt={item.book.title}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>📖</div>
                                  )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {item.type === 'review' && item.rating && (
                                    <div className="flex mb-1">
                                      {[1,2,3,4,5].map(s => (
                                        <span key={s} style={{ fontSize: 13, color: s <= item.rating! ? '#f59e0b' : '#e5e7eb' }}>★</span>
                                      ))}
                                    </div>
                                  )}
                                  {item.type === 'review' && item.content ? (
                                    <p style={{ fontSize: 13, color: '#424843', lineHeight: 1.6, fontStyle: 'italic' }}
                                      className="line-clamp-2">
                                      &quot;{item.content}&quot;
                                    </p>
                                  ) : (
                                    <p style={{ fontSize: 12, color: '#9DB5A4' }}>{item.book.authors?.[0]}</p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </div>

              {/* Sidebar */}
              <aside className="flex flex-col gap-6">

                {/* Hızlı Erişim */}
                <div style={{ backgroundColor: '#f4f3f1', borderRadius: 14, padding: 20, border: '1px solid #e8e8e5' }}>
                  <h3 style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 700, color: '#446651', marginBottom: 14 }}>
                    Hızlı Erişim
                  </h3>
                  <nav className="flex flex-col gap-1">
                    <Link href="/profile" style={{ fontSize: 13, color: '#424843', padding: '8px 0' }}>
                      🔖 Okuduklarım
                    </Link>
                    <Link href="/profile" style={{ fontSize: 13, color: '#424843', padding: '8px 0' }}>
                      ⏳ Okuyacaklarım
                    </Link>
                    <Link href="/profile" style={{ fontSize: 13, color: '#424843', padding: '8px 0' }}>
                      📖 Şu an Okuyorum
                    </Link>
                    <Link href="/stats" style={{ fontSize: 13, color: '#424843', padding: '8px 0' }}>
                      🏅 {currentYear} Hedefim
                    </Link>
                  </nav>
                  <button onClick={openSearch}
                    style={{ display: 'block', width: '100%', marginTop: 16, backgroundColor: '#446651', color: 'white', textAlign: 'center', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    + Kitap Ekle
                  </button>
                </div>

                {/* Popüler Listeler */}
                <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20, border: '1px solid #e8e8e5' }}>
                  <h3 style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 700, color: '#446651', marginBottom: 14 }}>
                    Listeleri seviyor musunuz?
                  </h3>
                  <div className="flex flex-col">
                    {popularLists.map((list, i) => (
                      <div key={list.title} style={{ padding: '10px 0', borderBottom: i < popularLists.length - 1 ? '1px solid #f4f4f0' : 'none' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D' }}>{list.title}</p>
                        <div className="flex justify-between" style={{ marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: '#9DB5A4' }}>{list.books} Kitap</span>
                          <span style={{ fontSize: 11, color: '#6c5b4d' }}>{list.members} Üye</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/lists"
                    style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, fontWeight: 600, color: '#446651', textDecoration: 'underline' }}>
                    Tüm Listeleri Gör
                  </Link>
                </div>

              </aside>

            </div>
          </main>

          {/* Footer */}
          <footer style={{ backgroundColor: 'white', borderTop: '1px solid #e8e8e5', marginTop: 32 }}>
            <div className="max-w-desktop mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <p style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#446651', marginBottom: 8 }}>
                  Readora
                </p>
                <p style={{ fontSize: 13, color: '#9DB5A4', maxWidth: 280, lineHeight: 1.6 }}>
                  Edebiyatın dijital kütüphanesi. Keşfet, oku ve paylaş.
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#6c5b4d', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  Platform
                </p>
                <div className="flex flex-col gap-2">
                  <span style={footerLinkStyle}>Hakkımızda</span>
                  <span style={footerLinkStyle}>Kariyer</span>
                  <span style={footerLinkStyle}>Bize Ulaşın</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#6c5b4d', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  Yasal
                </p>
                <div className="flex flex-col gap-2">
                  <span style={footerLinkStyle}>Gizlilik Politikası</span>
                  <span style={footerLinkStyle}>Kullanım Şartları</span>
                  <span style={footerLinkStyle}>Çerez Ayarları</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f4f4f0' }} className="max-w-desktop mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
              <p style={{ fontSize: 12, color: '#c1c8c1' }}>© {currentYear} Readora. Tüm hakları saklıdır.</p>
              <div className="flex gap-3" style={{ fontSize: 16 }}>
                <span style={{ cursor: 'pointer' }}>🌐</span>
                <span style={{ cursor: 'pointer' }}>✉️</span>
                <span style={{ cursor: 'pointer' }}>🔗</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
