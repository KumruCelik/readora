'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

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

const statusLabel: Record<string, string> = {
  WANT_TO_READ: '📌 Okuyacağım listesine ekledi',
  READING:      '📖 Okumaya başladı',
  READ:         '✅ Okudu',
}

export default function HomePage() {
  const [feed, setFeed]             = useState<FeedItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(!!token)
    if (token) fetchFeed()
    else setLoading(false)
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">

        {!isLoggedIn ? (

          /* Giriş yapılmamış — Hero */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h1 style={{ fontFamily: 'serif', fontSize: 32, fontWeight: 700, color: '#2D2D2D' }} className="mb-3">
              Readora&apos;ya Hoş Geldin
            </h1>
            <p className="text-gray-500 mb-8 text-lg">Kitaplarla yaşa. Oku, keşfet, paylaş.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/register"
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

        ) : loading ? (

          <div className="flex justify-center py-20">
            <div className="text-gray-400">Yükleniyor...</div>
          </div>

        ) : feed.length === 0 ? (

          /* Feed boş */
          <div style={{ backgroundColor: 'white', borderRadius: 20, padding: 32, textAlign: 'center', border: '1px solid #c1c8c1' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2D2D2D', marginBottom: 8 }}>
              Henüz güncelleme yok
            </h2>
            <p style={{ fontSize: 14, color: '#9DB5A4', lineHeight: 1.7, marginBottom: 20 }}>
              Arkadaşlarını takip ederek onların okuma güncellemelerini burada görebilirsin.
            </p>
            <Link href="/books/search"
              style={{ backgroundColor: '#7B9E87', color: 'white', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14 }}>
              Kitap Keşfet
            </Link>
          </div>

        ) : (

          /* Feed */
          <div className="flex flex-col gap-4">
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2D2D2D' }}>
              📰 Arkadaşlarının Aktiviteleri
            </h2>

            {feed.map(item => (
              <div key={`${item.type}-${item.id}`}
                style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, border: '1px solid #e8e8e5' }}>

                {/* Kullanıcı */}
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#7B9E87', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    {item.user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#2D2D2D' }}>
                      @{item.user.username}
                    </span>
                    <span style={{ fontSize: 13, color: '#9DB5A4' }}>
                      {' '}{item.type === 'shelf'
                        ? statusLabel[item.status!] || item.status
                        : '⭐ yorum yazdı'}
                    </span>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#c1c8c1' }}>
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                {/* Kitap */}
                <Link href={`/books/${item.book.id}`}>
                  <div className="flex gap-3 hover:opacity-80 transition-opacity">
                    <div style={{ width: 48, height: 64, borderRadius: 8, overflow: 'hidden', backgroundColor: '#EEF2EC', flexShrink: 0 }}>
                      {item.book.coverUrl ? (
                        <img src={item.book.coverUrl} alt={item.book.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>📖</div>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#2D2D2D' }}>{item.book.title}</p>
                      <p style={{ fontSize: 12, color: '#9DB5A4' }}>{item.book.authors?.[0]}</p>
                      {item.type === 'review' && item.rating && (
                        <div className="flex mt-1">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: 12, color: s <= item.rating! ? '#f59e0b' : '#e5e7eb' }}>★</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Yorum içeriği */}
                {item.type === 'review' && item.content && (
                  <p style={{ fontSize: 13, color: '#424843', marginTop: 10, lineHeight: 1.6, borderTop: '1px solid #f4f4f0', paddingTop: 10 }}>
                    &quot;{item.content}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
