'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

interface Book {
  id: string
  title: string
  authors: string[]
  coverUrl: string | null
  language: string
  avgRating: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!q) return

    setLoading(true)
    setError('')

    api.get('/books/search', { params: { q } })
      .then((res) => setBooks(res.data.data))
      .catch(() => setError('Arama sırasında bir hata oluştu.'))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Arama Sonuçları</h1>
      {q && <p className="text-gray-500 mb-6">&ldquo;{q}&rdquo; için sonuçlar</p>}

      {loading && <p className="text-gray-400">Yükleniyor...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && books.length === 0 && q && (
        <p className="text-gray-500">Sonuç bulunamadı.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {books.map((book) => (
          <Link key={book.id} href={`/books/${book.id}`} className="group">
            <div className="aspect-[2/3] bg-gray-100 rounded overflow-hidden mb-2">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center p-2">
                  {book.title}
                </div>
              )}
            </div>
            <p className="font-medium text-sm line-clamp-2">{book.title}</p>
            <p className="text-gray-500 text-xs">{book.authors.join(', ')}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
