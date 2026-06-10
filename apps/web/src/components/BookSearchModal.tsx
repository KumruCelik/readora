'use client'

import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import api from '@/lib/api'

interface Book {
  id?: string
  isbn: string
  title: string
  authors: string[]
  coverUrl: string | null
  language: string
  publishedAt: string
}

interface BookSearchContextValue {
  openSearch: () => void
}

const BookSearchContext = createContext<BookSearchContextValue>({ openSearch: () => {} })

export function useBookSearch() {
  return useContext(BookSearchContext)
}

export function BookSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <BookSearchContext.Provider value={{ openSearch: () => setOpen(true) }}>
      {children}
      {open && <BookSearchModal onClose={() => setOpen(false)} />}
    </BookSearchContext.Provider>
  )
}

function BookSearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery]     = useState('')
  const [books, setBooks]     = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [lang, setLang]       = useState<'en' | 'tr'>('en')
  const [adding, setAdding]   = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setMessage(null)

    try {
      const endpoint = lang === 'tr'
        ? `/books/search/turkish?q=${query}`
        : `/books/search?q=${query}`
      const res = await api.get(endpoint)
      setBooks(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function addToShelf(book: Book, status: string) {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setMessage('Rafa eklemek için giriş yapmalısın!')
      return
    }

    const bookKey = book.isbn || book.id || book.title
    setAdding(bookKey)

    try {
      const q = book.isbn ? `isbn:${book.isbn}` : encodeURIComponent(book.title)
      const searchRes = await api.get(`/books/search?q=${q}&limit=5`)
      const results = searchRes.data.data || []

      const dbBook = results.find((b: Book) =>
        b.title?.toLowerCase() === book.title?.toLowerCase()
      ) || results[0]

      if (!dbBook?.id) {
        setMessage('Kitap veritabanında bulunamadı')
        return
      }

      await api.patch(`/shelves/books/${dbBook.id}/status`, { status })

      const statusLabel = status === 'WANT_TO_READ'
        ? 'okuma listene'
        : status === 'READING'
        ? 'okuyorsun listene'
        : 'okudum listene'

      setMessage(`"${book.title}" ${statusLabel} eklendi! ✅`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setMessage(e.response?.data?.error?.message || 'Bir hata oluştu')
    } finally {
      setAdding(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  function goToBook(bookId?: string) {
    if (!bookId) return
    onClose()
    router.push(`/books/${bookId}`)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(45,45,45,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: '#faf9f6', borderRadius: 20, width: '100%', maxWidth: 880, padding: 24, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#9DB5A4', cursor: 'pointer' }}>
          ✕
        </button>

        <h2 style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, color: '#446651', marginBottom: 16 }}>
          📚 Kitap Ara
        </h2>

        <form onSubmit={handleSearch} className="flex flex-wrap gap-2" style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Kitap adı veya yazar ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, minWidth: 180, height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #c1c8c1', fontSize: 14, backgroundColor: 'white' }}
          />
          <button type="button" onClick={() => setLang('en')}
            style={{
              padding: '0 16px', height: 40, borderRadius: 8, border: '1px solid #c1c8c1', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              backgroundColor: lang === 'en' ? '#446651' : 'white', color: lang === 'en' ? 'white' : '#424843'
            }}>
            🌍 Global
          </button>
          <button type="button" onClick={() => setLang('tr')}
            style={{
              padding: '0 16px', height: 40, borderRadius: 8, border: '1px solid #c1c8c1', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              backgroundColor: lang === 'tr' ? '#446651' : 'white', color: lang === 'tr' ? 'white' : '#424843'
            }}>
            🇹🇷 Türkçe
          </button>
          <button type="submit" disabled={loading}
            style={{ padding: '0 20px', height: 40, borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', backgroundColor: '#7B9E87', color: 'white', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </form>

        {message && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#EEF2EC', border: '1px solid #c1c8c1', fontSize: 13, color: '#446651' }}>
            {message}
          </div>
        )}

        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book, i) => {
              const bookKey = book.isbn || book.id || book.title
              return (
                <div key={bookKey || i} style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #e8e8e5' }}>
                  <div
                    onClick={() => goToBook(book.id)}
                    style={{ width: '100%', height: 160, backgroundColor: '#EEF2EC', position: 'relative', cursor: book.id ? 'pointer' : 'default' }}
                  >
                    {book.coverUrl ? (
                      <Image src={book.coverUrl} alt={book.title} fill sizes="(max-width: 768px) 50vw, 220px" className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">📖</div>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <h3 className="line-clamp-2" style={{ fontSize: 13, fontWeight: 700, color: '#2D2D2D', marginBottom: 4, lineHeight: 1.3 }}>
                      {book.title}
                    </h3>
                    <p className="line-clamp-1" style={{ fontSize: 12, color: '#9DB5A4', marginBottom: 10 }}>
                      {book.authors?.join(', ')}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button onClick={() => addToShelf(book, 'WANT_TO_READ')} disabled={adding === bookKey}
                        style={{ fontSize: 12, padding: '6px 0', borderRadius: 6, border: '1px solid #c1c8c1', backgroundColor: 'white', cursor: 'pointer' }}>
                        {adding === bookKey ? '...' : '📌 Okuyacağım'}
                      </button>
                      <button onClick={() => addToShelf(book, 'READING')} disabled={adding === bookKey}
                        style={{ fontSize: 12, padding: '6px 0', borderRadius: 6, border: '1px solid #c1c8c1', backgroundColor: 'white', cursor: 'pointer' }}>
                        {adding === bookKey ? '...' : '📖 Okuyorum'}
                      </button>
                      <button onClick={() => addToShelf(book, 'READ')} disabled={adding === bookKey}
                        style={{ fontSize: 12, padding: '6px 0', borderRadius: 6, border: '1px solid #c1c8c1', backgroundColor: 'white', cursor: 'pointer' }}>
                        {adding === bookKey ? '...' : '✅ Okudum'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {books.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: '#9DB5A4', padding: '60px 0', fontSize: 14 }}>
              Aramak için yukarıdaki formu kullan 🔍
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
