'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import Image from 'next/image'

interface Book {
  id?: string
  isbn: string
  title: string
  authors: string[]
  coverUrl: string | null
  language: string
  publishedAt: string
}

export default function BookSearchPage() {
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

      console.log('dbBook:', dbBook)

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
      console.error('addToShelf error:', err)
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setMessage(e.response?.data?.error?.message || 'Bir hata oluştu')
    } finally {
      setAdding(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#2D2D2D] mb-8">📚 Kitap Ara</h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Kitap adı veya yazar ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-10 px-3 rounded-md border border-gray-300 text-sm"
          />
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-4 py-2 rounded-md border text-sm ${lang === 'en' ? 'bg-[#E8694A] text-white' : 'bg-white'}`}
          >
            🌍 Global
          </button>
          <button
            type="button"
            onClick={() => setLang('tr')}
            className={`px-4 py-2 rounded-md border text-sm ${lang === 'tr' ? 'bg-[#E8694A] text-white' : 'bg-white'}`}
          >
            🇹🇷 Türkçe
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-[#E8694A] text-white text-sm hover:bg-[#d4563a]"
          >
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </form>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book, i) => {
            const bookKey = book.isbn || book.id || book.title
            return (
              <div
                key={bookKey || i}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="w-full h-44 bg-gray-100 relative cursor-pointer"
                  onClick={() => book.id && router.push(`/books/${book.id}`)}
                >
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl">📖</div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-sm text-[#2D2D2D] line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                    {book.authors?.join(', ')}
                  </p>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => addToShelf(book, 'WANT_TO_READ')}
                      disabled={adding === bookKey}
                      className="w-full text-xs py-1 px-2 rounded bg-[#FAF7F2] hover:bg-[#E8694A] hover:text-white transition-colors border border-gray-200 disabled:opacity-50"
                    >
                      {adding === bookKey ? '...' : '📌 Okuyacağım'}
                    </button>
                    <button
                      onClick={() => addToShelf(book, 'READING')}
                      disabled={adding === bookKey}
                      className="w-full text-xs py-1 px-2 rounded bg-[#FAF7F2] hover:bg-blue-500 hover:text-white transition-colors border border-gray-200 disabled:opacity-50"
                    >
                      {adding === bookKey ? '...' : '📖 Okuyorum'}
                    </button>
                    <button
                      onClick={() => addToShelf(book, 'READ')}
                      disabled={adding === bookKey}
                      className="w-full text-xs py-1 px-2 rounded bg-[#FAF7F2] hover:bg-green-500 hover:text-white transition-colors border border-gray-200 disabled:opacity-50"
                    >
                      {adding === bookKey ? '...' : '✅ Okudum'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {books.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-20">
            Aramak için yukarıdaki formu kullan 🔍
          </div>
        )}
      </div>
    </div>
  )
}