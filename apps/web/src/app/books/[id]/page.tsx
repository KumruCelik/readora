'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import api from '@/lib/api'

interface Book {
  id: string
  title: string
  authors: string[]
  genres: string[]
  description: string | null
  coverUrl: string | null
  language: string
  avgRating: number
  ratingCount: number
  publishedAt: string | null
}

interface Review {
  id: string
  rating: number
  content: string
  hasSpoiler: boolean
  helpful: number
  createdAt: string
  user: { username: string; avatar: string | null }
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook]             = useState<Book | null>(null)
  const [reviews, setReviews]       = useState<Review[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [rating, setRating]         = useState(0)
  const [content, setContent]       = useState('')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage]       = useState<string | null>(null)
  const [showSpoiler, setShowSpoiler] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editRating, setEditRating]   = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fetchBook = useCallback(async () => {
    try {
      const res = await api.get(`/books/${id}`)
      setBook(res.data.data)
    } catch {
      setError('Kitap bulunamadı.')
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchReviews = useCallback(async () => {
    const res = await api.get(`/reviews/book/${id}`)
    setReviews(res.data.data)
  }, [id])

  useEffect(() => {
    fetchBook()
    fetchReviews().catch(console.error)
  }, [fetchBook, fetchReviews])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      api.get('/auth/me').then(res => {
        setCurrentUserId(res.data.data.username)
      }).catch(() => {})
    }
  }, [])

  async function addToShelf(status: string) {
    try {
      await api.patch(`/shelves/books/${id}/status`, { status })
      const label = status === 'WANT_TO_READ' ? 'Okuyacağım' : status === 'READING' ? 'Okuyorum' : 'Okudum'
      setMessage(`"${label}" listene eklendi! ✅`)
      setTimeout(() => setMessage(null), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setMessage('Lütfen puan ver'); return }
    setSubmitting(true)
    try {
      await api.post('/reviews', { bookId: id, rating, content, hasSpoiler })
      setMessage('Yorumun eklendi! ✅')
      setShowForm(false)
      setRating(0)
      setContent('')
      setHasSpoiler(false)
      await Promise.all([fetchReviews(), fetchBook()])
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setMessage(e.response?.data?.error?.message || 'Bir hata oluştu')
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  function startEdit(review: Review) {
    setEditingId(review.id)
    setEditContent(review.content)
    setEditRating(review.rating)
  }

  async function handleUpdateReview(reviewId: string) {
    try {
      await api.patch(`/reviews/${reviewId}`, { rating: editRating, content: editContent })
      setEditingId(null)
      fetchReviews()
      fetchBook()
      setMessage('Yorum güncellendi ✅')
      setTimeout(() => setMessage(null), 2000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setMessage(e.response?.data?.error?.message || 'Hata oluştu')
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Yorumu silmek istediğine emin misin?')) return
    try {
      await api.delete(`/reviews/${reviewId}`)
      fetchReviews()
      fetchBook()
      setMessage('Yorum silindi ✅')
      setTimeout(() => setMessage(null), 2000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setMessage(e.response?.data?.error?.message || 'Hata oluştu')
    }
  }

  function DescriptionSection({ description }: { description: string }) {
    const [expanded, setExpanded] = useState(false)
    const isLong = description.length > 300

    return (
      <div className="mb-4">
        <p className={`text-sm text-gray-600 leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
          {description}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs mt-1 font-semibold"
            style={{ color: '#7B9E87' }}
          >
            {expanded ? '↑ Daha az göster' : '↓ Devamını oku'}
          </button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Yükleniyor...</p>
      </div>
    )
  }

  if (error || !book) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Kitap Detay */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex gap-6">
          <div className="w-32 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-4xl">📖</div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#2D2D2D] mb-1">{book.title}</h1>
            <p className="text-gray-500 mb-2">{book.authors.join(', ')}</p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-xl ${s <= Math.round(book.avgRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {book.avgRating.toFixed(1)} ({book.ratingCount} değerlendirme)
              </span>
            </div>

            {book.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {book.genres.map(g => (
                  <span key={g} className="text-xs bg-gray-100 px-2 py-1 rounded">{g}</span>
                ))}
              </div>
            )}

            {book.description && (
              <DescriptionSection description={book.description} />
            )}

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => addToShelf('WANT_TO_READ')}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-300 hover:bg-[#E8694A] hover:text-white hover:border-[#E8694A] transition-colors">
                📌 Okuyacağım
              </button>
              <button onClick={() => addToShelf('READING')}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors">
                📖 Okuyorum
              </button>
              <button onClick={() => addToShelf('READ')}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors">
                ✅ Okudum
              </button>
              <button onClick={() => setShowForm(!showForm)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#E8694A] text-white hover:bg-[#d4563a] transition-colors">
                ✍️ Yorum Yaz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mesaj */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Yorum Formu */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">✍️ Yorum Yaz</h2>
          <form onSubmit={submitReview}>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)}
                  className={`text-3xl transition-colors ${s <= rating ? 'text-yellow-400' : 'text-gray-200'} hover:text-yellow-400`}>
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 self-center">
                {rating > 0 ? `${rating}/5` : 'Puan ver'}
              </span>
            </div>

            <textarea
              placeholder="Kitap hakkında düşüncelerini yaz..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E8694A] mb-3"
            />

            <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 cursor-pointer">
              <input type="checkbox" checked={hasSpoiler}
                onChange={(e) => setHasSpoiler(e.target.checked)} className="rounded" />
              ⚠️ Bu yorum spoiler içeriyor
            </label>

            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-[#E8694A] text-white rounded-md text-sm hover:bg-[#d4563a] disabled:opacity-50">
                {submitting ? 'Gönderiliyor...' : 'Yorum Yayınla'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Yorumlar */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">
          💬 Yorumlar ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Henüz yorum yok. İlk yorumu sen yaz!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => {
              const isOwn = currentUserId === review.user.username
              return (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#7B9E87] flex items-center justify-center text-white text-sm font-bold">
                        {review.user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-[#2D2D2D]">@{review.user.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                      {isOwn && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => startEdit(review)}
                            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-red-50 text-red-400"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingId === review.id ? (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-2">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setEditRating(s)}
                            className={`text-2xl ${s <= editRating ? 'text-yellow-400' : 'text-gray-200'}`}>
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7B9E87] mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateReview(review.id)}
                          className="text-xs px-3 py-1.5 rounded-md text-white"
                          style={{ backgroundColor: '#7B9E87' }}
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs px-3 py-1.5 rounded-md border border-gray-300"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {review.hasSpoiler && !showSpoiler[review.id] ? (
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-500 mb-2">⚠️ Bu yorum spoiler içeriyor</p>
                          <button
                            onClick={() => setShowSpoiler(prev => ({ ...prev, [review.id]: true }))}
                            className="text-xs underline"
                            style={{ color: '#7B9E87' }}>
                            Göster
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">{review.content}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                        <button
                          onClick={async () => { await api.post(`/reviews/${review.id}/helpful`); fetchReviews() }}
                          className="text-xs text-gray-400 hover:text-[#7B9E87]">
                          👍 Faydalı ({review.helpful})
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
