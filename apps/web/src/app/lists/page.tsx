'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

interface BookList {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  createdAt: string
  _count: { books: number }
  books: {
    book: {
      id: string
      title: string
      coverUrl: string | null
    }
  }[]
}

export default function ListsPage() {
  const router = useRouter()
  const [lists, setLists]           = useState<BookList[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage]       = useState<string | null>(null)

  const fetchLists = useCallback(async () => {
    try {
      const res = await api.get('/lists/my')
      setLists(res.data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/login'); return }
    fetchLists()
  }, [router, fetchLists])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await api.post('/lists', { title, description, isPublic })
      setMessage('Liste oluşturuldu! ✅')
      setShowForm(false)
      setTitle('')
      setDescription('')
      fetchLists()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setMessage(e.response?.data?.error?.message || 'Hata oluştu')
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Listeyi silmek istediğine emin misin?')) return
    try {
      await api.delete(`/lists/${id}`)
      setLists(prev => prev.filter(l => l.id !== id))
      setMessage('Liste silindi ✅')
      setTimeout(() => setMessage(null), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <div className="max-w-desktop mx-auto px-4 md:px-8 py-8">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: 'serif', fontSize: 32, fontWeight: 700, color: '#2D2D2D' }}>
              📋 Listopia
            </h1>
            <p style={{ fontSize: 14, color: '#9DB5A4', marginTop: 4 }}>
              Kendi kitap listelerini oluştur ve paylaş
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ backgroundColor: '#7B9E87', color: 'white', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
          >
            + Yeni Liste
          </button>
        </div>

        {/* Mesaj */}
        {message && (
          <div style={{ backgroundColor: '#f0f7f3', border: '1px solid #7B9E87', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#446651' }}>
            {message}
          </div>
        )}

        {/* Liste Oluşturma Formu */}
        {showForm && (
          <div style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, marginBottom: 20, border: '1px solid #e8e8e5' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2D2D2D', marginBottom: 16 }}>
              Yeni Liste Oluştur
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#424843', textTransform: 'uppercase' }}>
                  LİSTE ADI *
                </label>
                <input
                  type="text"
                  placeholder="Örn: 2024'te Okuduklarım"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ backgroundColor: '#EEF2EC', borderRadius: 12, border: '1.5px solid transparent', padding: '12px 14px', fontSize: 14, outline: 'none' }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#424843', textTransform: 'uppercase' }}>
                  AÇIKLAMA
                </label>
                <textarea
                  placeholder="Liste hakkında kısa bir açıklama..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  style={{ backgroundColor: '#EEF2EC', borderRadius: 12, border: '1.5px solid transparent', padding: '12px 14px', fontSize: 14, outline: 'none', resize: 'none' }}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 14, color: '#424843' }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  style={{ accentColor: '#7B9E87' }}
                />
                Herkese açık liste
              </label>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#7B9E87', color: 'white', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ border: '1px solid #c1c8c1', borderRadius: 10, padding: '10px 20px', fontSize: 14, cursor: 'pointer', backgroundColor: 'white' }}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listeler */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9DB5A4' }}>Yükleniyor...</div>
        ) : lists.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px solid #e8e8e5' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#2D2D2D', marginBottom: 8 }}>
              Henüz liste yok
            </p>
            <p style={{ fontSize: 14, color: '#9DB5A4' }}>
              İlk listeni oluştur ve kitaplarını organize et!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map(list => (
              <div key={list.id}
                style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, border: '1px solid #e8e8e5' }}>

                {/* Liste Başlık */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2D2D' }}>
                      {list.title}
                    </h3>
                    {list.description && (
                      <p style={{ fontSize: 13, color: '#9DB5A4', marginTop: 4 }}>
                        {list.description}
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: '#c1c8c1', marginTop: 4 }}>
                      {list._count.books} kitap • {list.isPublic ? '🌍 Herkese açık' : '🔒 Özel'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(list.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c1c8c1', fontSize: 16, padding: 4 }}
                  >
                    🗑️
                  </button>
                </div>

                {/* Kitap Kapakları */}
                <div className="flex gap-2 mb-3">
                  {list.books.slice(0, 4).map(item => (
                    <div key={item.book.id}
                      style={{ width: 48, height: 64, borderRadius: 6, overflow: 'hidden', backgroundColor: '#EEF2EC' }}>
                      {item.book.coverUrl ? (
                        <img src={item.book.coverUrl} alt={item.book.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 18 }}>📖</div>
                      )}
                    </div>
                  ))}
                  {list._count.books === 0 && (
                    <div style={{ fontSize: 13, color: '#9DB5A4', alignSelf: 'center' }}>
                      Henüz kitap eklenmedi
                    </div>
                  )}
                </div>

                {/* Detay Butonu */}
                <Link href={`/lists/${list.id}`}
                  style={{ fontSize: 13, fontWeight: 600, color: '#7B9E87' }}>
                  Listeyi Görüntüle →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}