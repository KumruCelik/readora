'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useBookSearch } from '@/components/BookSearchModal'

interface BookList {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  user: { username: string }
  _count: { books: number }
  books: {
    book: {
      id: string
      title: string
      authors: string[]
      coverUrl: string | null
      avgRating: number
    }
    note: string | null
  }[]
}

export default function ListDetailPage() {
  const { openSearch } = useBookSearch()
  const { id } = useParams<{ id: string }>()
  const [list, setList]     = useState<BookList | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const fetchList = useCallback(async () => {
    try {
      const res = await api.get(`/lists/${id}`)
      setList(res.data.data)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  async function removeBook(bookId: string) {
    try {
      await api.delete(`/lists/${id}/books/${bookId}`)
      setMessage('Kitap listeden çıkarıldı ✅')
      fetchList()
      setTimeout(() => setMessage(null), 2000)
    } catch { /* ignore */ }
  }

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <div style={{ textAlign: 'center', padding: 60, color: '#9DB5A4' }}>Yükleniyor...</div>
    </div>
  )

  if (!list) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <div className="max-w-desktop mx-auto px-4 md:px-8 py-8">

        {/* Geri */}
        <Link href="/lists" style={{ fontSize: 13, color: '#9DB5A4', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
          ← Listelerim
        </Link>

        {/* Başlık */}
        <div style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, marginBottom: 20, border: '1px solid #e8e8e5' }}>
          <h1 style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, color: '#2D2D2D', marginBottom: 6 }}>
            {list.title}
          </h1>
          {list.description && (
            <p style={{ fontSize: 14, color: '#9DB5A4', marginBottom: 8 }}>{list.description}</p>
          )}
          <p style={{ fontSize: 12, color: '#c1c8c1' }}>
            @{list.user.username} • {list._count.books} kitap • {list.isPublic ? '🌍 Herkese açık' : '🔒 Özel'}
          </p>
        </div>

        {/* Mesaj */}
        {message && (
          <div style={{ backgroundColor: '#f0f7f3', border: '1px solid #7B9E87', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#446651' }}>
            {message}
          </div>
        )}

        {/* Kitaplar */}
        {list.books.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px solid #e8e8e5' }}>
            <p style={{ fontSize: 16, color: '#9DB5A4' }}>
              Bu listede henüz kitap yok.
            </p>
            <button onClick={openSearch}
              style={{ display: 'inline-block', marginTop: 16, backgroundColor: '#7B9E87', color: 'white', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              Kitap Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.books.map(({ book, note }, index) => (
              <div key={book.id}
                style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, border: '1px solid #e8e8e5', display: 'flex', gap: 14, alignItems: 'center' }}>

                {/* Sıra */}
                <div style={{ fontSize: 16, fontWeight: 700, color: '#c1c8c1', width: 24, textAlign: 'center' }}>
                  {index + 1}
                </div>

                {/* Kapak */}
                <div style={{ width: 52, height: 72, borderRadius: 8, overflow: 'hidden', backgroundColor: '#EEF2EC', flexShrink: 0 }}>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 22 }}>📖</div>
                  )}
                </div>

                {/* Bilgi */}
                <div style={{ flex: 1 }}>
                  <Link href={`/books/${book.id}`}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#2D2D2D' }}>{book.title}</p>
                  </Link>
                  <p style={{ fontSize: 12, color: '#9DB5A4' }}>{book.authors?.[0]}</p>
                  {note && (
                    <p style={{ fontSize: 12, color: '#424843', marginTop: 4, fontStyle: 'italic' }}>
                      &quot;{note}&quot;
                    </p>
                  )}
                  {book.avgRating > 0 && (
                    <p style={{ fontSize: 11, color: '#7B9E87', marginTop: 2 }}>
                      ⭐ {book.avgRating.toFixed(1)}
                    </p>
                  )}
                </div>

                {/* Sil */}
                <button
                  onClick={() => removeBook(book.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c1c8c1', fontSize: 16 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Kitap Ekle Butonu */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={openSearch}
            style={{ backgroundColor: '#7B9E87', color: 'white', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            + Kitap Ekle
          </button>
        </div>

      </div>
    </div>
  )
}