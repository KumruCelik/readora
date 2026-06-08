'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface Notification {
  id: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn]       = useState(false)
  const [unreadCount, setUnreadCount]     = useState(0)
  const [showNotifs, setShowNotifs]       = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      setIsLoggedIn(!!token)
      if (token) {
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
      }
    }
  }, [])

  async function fetchUnreadCount() {
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data.data.count)
    } catch { /* ignore */ }
  }

  async function fetchNotifications() {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data)
      await api.patch('/notifications/all/read')
      setUnreadCount(0)
    } catch { /* ignore */ }
  }

  function handleLogout() {
    localStorage.removeItem('accessToken')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e5', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link href="/" style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#446651' }}>
          📚 Readora
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/books/search"
            style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
            Kitap Ara
          </Link>

          {isLoggedIn ? (
            <>
              {/* Bildirim Zili */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowNotifs(!showNotifs)
                    if (!showNotifs) fetchNotifications()
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, position: 'relative' }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      backgroundColor: '#E8694A', color: 'white',
                      borderRadius: 10, fontSize: 10, fontWeight: 700,
                      padding: '1px 5px', minWidth: 16, textAlign: 'center'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div style={{
                    position: 'absolute', right: 0, top: 36,
                    width: 300, backgroundColor: 'white',
                    borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #e8e8e5', zIndex: 100,
                    maxHeight: 400, overflowY: 'auto'
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f0' }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#2D2D2D' }}>Bildirimler</p>
                    </div>

                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: '#9DB5A4', fontSize: 13 }}>
                        Henüz bildirim yok
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f4f4f0',
                          backgroundColor: notif.isRead ? 'white' : '#f0f7f3',
                        }}>
                          <p style={{ fontSize: 13, color: '#2D2D2D', lineHeight: 1.5 }}>
                            {notif.message}
                          </p>
                          <p style={{ fontSize: 11, color: '#c1c8c1', marginTop: 4 }}>
                            {new Date(notif.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Link href="/lists"
                style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
                Listelerim
              </Link>

              <Link href="/stats"
                style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
                İstatistikler
              </Link>

              <Link href="/clubs"
                style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
                Kulüpler
              </Link>

              <Link href="/profile"
                style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
                Profil
              </Link>

              <button onClick={handleLogout}
                style={{ fontSize: 13, color: '#9DB5A4', background: 'none', border: 'none', cursor: 'pointer' }}>
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
                Giriş Yap
              </Link>
              <Link href="/register"
                style={{ backgroundColor: '#7B9E87', color: 'white', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700 }}>
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
