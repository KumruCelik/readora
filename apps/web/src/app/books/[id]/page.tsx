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

const shelfOptions = [
  { status: 'WANT_TO_READ', label: 'Okuyacağım', icon: '📌' },
  { status: 'READING', label: 'Okuyorum', icon: '📖' },
  { status: 'READ', label: 'Okudum', icon: '✅' },
]

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
  const [showShelfMenu, setShowShelfMenu] = useState(false)
  const [sortBy, setSortBy]           = useState<'newest' | 'helpful'>('newest')
  const [visibleCount, setVisibleCount] = useState(5)
  const [copied, setCopied]           = useState(false)

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
      const label = shelfOptions.find(o => o.status === status)?.label
      setMessage(`"${label}" listene eklendi! ✅`)
      setShowShelfMenu(false)
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

  function handleQuickRate(s: number) {
    setRating(s)
    setShowForm(true)
  }

  function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function DescriptionSection({ description }: { description: string }) {
    const [expanded, setExpanded] = useState(false)
    const isLong = description.length > 320

    return (
      <div>
        <p style={{ fontSize: 14, color: '#424843', lineHeight: 1.7 }}
          className={!expanded && isLong ? 'line-clamp-4' : ''}>
          {description}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ fontSize: 13, marginTop: 8, fontWeight: 700, color: '#446651', background: 'none', border: 'none', cursor: 'pointer' }}
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
        <p style={{ color: '#9DB5A4' }}>Yükleniyor...</p>
      </div>
    )
  }

  if (error || !book) {
    return <div className="p-8" style={{ color: '#ba1a1a' }}>{error}</div>
  }

  const sortedReviews = [...reviews].sort((a, b) =>
    sortBy === 'helpful'
      ? b.helpful - a.helpful
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const visibleReviews = sortedReviews.slice(0, visibleCount)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf9f6' }}>
      <div className="max-w-desktop mx-auto px-4 md:px-8 py-10">

        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Sol: Kapak + Aksiyonlar */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start gap-4">
            <div style={{
              width: 240, height: 340, borderRadius: 12, overflow: 'hidden',
              backgroundColor: '#EEF2EC', position: 'relative',
              boxShadow: '10px 10px 24px rgba(0,0,0,0.08)'
            }}>
              {book.coverUrl ? (
                <Image src={book.coverUrl} alt={book.title} fill sizes="240px" className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-6xl">📖</div>
              )}
            </div>

            <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Rafa Ekle */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowShelfMenu(!showShelfMenu)}
                  style={{
                    width: '100%', backgroundColor: '#446651', color: 'white', border: 'none',
                    borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}>
                  📚 Kitaplığa Ekle <span style={{ fontSize: 12 }}>{showShelfMenu ? '▲' : '▼'}</span>
                </button>
                {showShelfMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
                    backgroundColor: 'white', borderRadius: 10, border: '1px solid #e8e8e5',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 10, overflow: 'hidden'
                  }}>
                    {shelfOptions.map(opt => (
                      <button key={opt.status} onClick={() => addToShelf(opt.status)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 13,
                          color: '#2D2D2D', background: 'none', border: 'none', cursor: 'pointer',
                          borderBottom: '1px solid #f4f4f0'
                        }}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Yorum Yaz */}
              <button onClick={() => setShowForm(!showForm)}
                style={{
                  width: '100%', backgroundColor: 'white', color: '#446651', border: '1px solid #446651',
                  borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer'
                }}>
                ✍️ Yorum Yaz
              </button>

              {/* Hızlı puanlama */}
              <div className="flex flex-col items-center gap-2" style={{ padding: '12px 0' }}>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => handleQuickRate(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, lineHeight: 1, color: s <= rating ? '#f2c14e' : '#c1c8c1' }}>
                      ★
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#9DB5A4' }}>Bu kitabı değerlendirin</span>
              </div>
            </div>
          </div>

          {/* Sağ: Bilgiler */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 style={{ fontFamily: 'serif', fontSize: 36, fontWeight: 700, color: '#2D2D2D', lineHeight: 1.2, marginBottom: 6 }}>
                  {book.title}
                </h1>
                <p style={{ fontSize: 16, color: '#6c5b4d', fontWeight: 500 }}>
                  {book.authors.join(', ')}
                </p>
              </div>
              <button onClick={handleShare}
                style={{ background: 'none', border: '1px solid #c1c8c1', borderRadius: 999, width: 40, height: 40, fontSize: 16, cursor: 'pointer', flexShrink: 0 }}
                title="Bağlantıyı kopyala">
                {copied ? '✅' : '🔗'}
              </button>
            </div>

            {/* İstatistik Çubuğu */}
            <div className="flex items-center gap-6 flex-wrap" style={{ borderTop: '1px solid #e8e8e5', borderBottom: '1px solid #e8e8e5', padding: '14px 0' }}>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: 22, color: s <= Math.round(book.avgRating) ? '#f2c14e' : '#c1c8c1' }}>★</span>
                  ))}
                </div>
                <span style={{ fontFamily: 'serif', fontSize: 26, fontWeight: 700, color: '#2D2D2D' }}>
                  {book.avgRating.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col" style={{ borderLeft: '1px solid #e8e8e5', paddingLeft: 24 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#2D2D2D' }}>{book.ratingCount}</span>
                <span style={{ fontSize: 12, color: '#9DB5A4' }}>değerlendirme</span>
              </div>
              <div className="flex flex-col" style={{ borderLeft: '1px solid #e8e8e5', paddingLeft: 24 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#2D2D2D' }}>{reviews.length}</span>
                <span style={{ fontSize: 12, color: '#9DB5A4' }}>yorum</span>
              </div>
            </div>

            {/* Açıklama */}
            {book.description && (
              <DescriptionSection description={book.description} />
            )}

            {/* Türler */}
            {book.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span style={{ fontSize: 12, fontWeight: 700, color: '#9DB5A4', letterSpacing: 1, marginRight: 4 }}>
                  TÜRLER
                </span>
                {book.genres.map(g => (
                  <span key={g} style={{ backgroundColor: '#E8E4DB', color: '#6c5b4d', fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 999 }}>
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-col gap-1 mt-1">
              {book.publishedAt && (
                <p style={{ fontSize: 12, color: '#9DB5A4' }}>
                  İlk yayınlanma tarihi {new Date(book.publishedAt).toLocaleDateString('tr-TR')}
                </p>
              )}
              <p style={{ fontSize: 12, color: '#9DB5A4' }}>
                Dil: {book.language?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Mesaj */}
        {message && (
          <div className="mt-8" style={{ padding: 12, borderRadius: 10, backgroundColor: '#EEF2EC', border: '1px solid #c1c8c1', fontSize: 13, color: '#446651' }}>
            {message}
          </div>
        )}

        {/* Yorum Formu */}
        {showForm && (
          <section className="mt-10 pt-8" style={{ borderTop: '1px solid #e8e8e5' }}>
            <h3 style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#2D2D2D', marginBottom: 16 }}>
              Yorum Yaz
            </h3>
            <div style={{ backgroundColor: '#f4f3f1', borderRadius: 16, padding: 24, border: '1px solid #e8e8e5' }}>
              <form onSubmit={submitReview}>
                <div className="flex items-center gap-4 mb-4">
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', backgroundColor: '#7B9E87',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0
                  }}>
                    {currentUserId ? currentUserId.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setRating(s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 30, lineHeight: 1, color: s <= rating ? '#f2c14e' : '#c1c8c1' }}>
                          ★
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: '#9DB5A4' }}>
                      {rating > 0 ? `${rating}/5 puan verdin` : 'Bu kitaba puan ver'}
                    </p>
                  </div>
                </div>

                <textarea
                  placeholder="Bu kitap hakkında düşüncelerini yaz..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #c1c8c1', fontSize: 14, resize: 'none', backgroundColor: 'white', marginBottom: 12 }}
                />

                <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13, color: '#424843', marginBottom: 16 }}>
                  <input type="checkbox" checked={hasSpoiler}
                    onChange={(e) => setHasSpoiler(e.target.checked)} />
                  ⚠️ Bu yorum spoiler içeriyor
                </label>

                <div className="flex gap-2">
                  <button type="submit" disabled={submitting}
                    style={{ backgroundColor: '#446651', color: 'white', border: 'none', borderRadius: 999, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? 'Gönderiliyor...' : 'Yorumu Yayınla'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ backgroundColor: 'white', color: '#424843', border: '1px solid #c1c8c1', borderRadius: 999, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Topluluk Yorumları */}
        <section className="mt-10 pt-8" style={{ borderTop: '1px solid #e8e8e5' }}>
          <div className="flex justify-between items-end flex-wrap gap-3 mb-6">
            <h3 style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#2D2D2D' }}>
              Topluluk Yorumları ({reviews.length})
            </h3>
            {reviews.length > 0 && (
              <div className="flex items-center gap-3" style={{ fontSize: 13 }}>
                <span style={{ color: '#9DB5A4' }}>Sırala:</span>
                <button onClick={() => setSortBy('newest')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: sortBy === 'newest' ? 700 : 500, color: sortBy === 'newest' ? '#446651' : '#9DB5A4' }}>
                  En Yeni
                </button>
                <button onClick={() => setSortBy('helpful')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: sortBy === 'helpful' ? 700 : 500, color: sortBy === 'helpful' ? '#446651' : '#9DB5A4' }}>
                  Faydalı
                </button>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p style={{ color: '#9DB5A4', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>
              Henüz yorum yok. İlk yorumu sen yaz!
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {visibleReviews.map(review => {
                const isOwn = currentUserId === review.user.username
                return (
                  <div key={review.id} className="flex flex-col md:flex-row gap-4" style={{ borderBottom: '1px solid #e8e8e5', paddingBottom: 24 }}>
                    <div className="w-full md:w-44 shrink-0 flex items-start gap-3">
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', backgroundColor: '#7B9E87',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0
                      }}>
                        {review.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#2D2D2D' }}>@{review.user.username}</p>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ fontSize: 14, color: s <= review.rating ? '#f2c14e' : '#c1c8c1' }}>★</span>
                          ))}
                        </div>
                        {isOwn && (
                          <div className="flex gap-1 mt-2">
                            <button onClick={() => startEdit(review)}
                              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, border: '1px solid #e8e8e5', background: 'white', color: '#9DB5A4', cursor: 'pointer' }}>
                              ✏️
                            </button>
                            <button onClick={() => handleDeleteReview(review.id)}
                              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, border: '1px solid #e8e8e5', background: 'white', color: '#ba1a1a', cursor: 'pointer' }}>
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      {editingId === review.id ? (
                        <div>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} type="button" onClick={() => setEditRating(s)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: s <= editRating ? '#f2c14e' : '#c1c8c1' }}>
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #c1c8c1', fontSize: 14, resize: 'none', marginBottom: 8 }}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateReview(review.id)}
                              style={{ fontSize: 12, padding: '6px 16px', borderRadius: 999, border: 'none', backgroundColor: '#446651', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                              Kaydet
                            </button>
                            <button onClick={() => setEditingId(null)}
                              style={{ fontSize: 12, padding: '6px 16px', borderRadius: 999, border: '1px solid #c1c8c1', backgroundColor: 'white', cursor: 'pointer' }}>
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {review.hasSpoiler && !showSpoiler[review.id] ? (
                            <div style={{ backgroundColor: '#f4f3f1', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                              <p style={{ fontSize: 13, color: '#9DB5A4', marginBottom: 8 }}>⚠️ Bu yorum spoiler içeriyor</p>
                              <button
                                onClick={() => setShowSpoiler(prev => ({ ...prev, [review.id]: true }))}
                                style={{ fontSize: 12, textDecoration: 'underline', color: '#446651', background: 'none', border: 'none', cursor: 'pointer' }}>
                                Göster
                              </button>
                            </div>
                          ) : (
                            <p style={{ fontSize: 14, color: '#424843', lineHeight: 1.7 }}>{review.content}</p>
                          )}

                          <div className="flex items-center gap-4 mt-3">
                            <button
                              onClick={async () => { await api.post(`/reviews/${review.id}/helpful`); fetchReviews() }}
                              style={{ fontSize: 12, color: '#9DB5A4', border: '1px solid #e8e8e5', borderRadius: 999, padding: '4px 14px', background: 'white', cursor: 'pointer' }}>
                              👍 Faydalı ({review.helpful})
                            </button>
                            <span style={{ fontSize: 12, color: '#9DB5A4', marginLeft: 'auto' }}>
                              {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {visibleCount < sortedReviews.length && (
            <button onClick={() => setVisibleCount(c => c + 5)}
              style={{ width: '100%', marginTop: 24, padding: '14px 0', borderRadius: 10, border: '1px solid #c1c8c1', backgroundColor: 'white', color: '#2D2D2D', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Daha Fazla Yorum Göster
            </button>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 flex flex-col items-center gap-1" style={{ borderTop: '1px solid #e8e8e5' }}>
          <span style={{ fontFamily: 'serif', fontSize: 20, fontWeight: 700, color: '#446651' }}>📚 Readora</span>
          <p style={{ fontSize: 12, color: '#9DB5A4' }}>© 2026 Readora</p>
        </footer>
      </div>
    </div>
  )
}
