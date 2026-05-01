'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/books/${id}`)
      .then((res) => setBook(res.data.data))
      .catch(() => setError('Kitap bulunamadı.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-gray-400">Yükleniyor...</div>
  if (error || !book) return <div className="p-8 text-red-500">{error}</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        <div className="w-40 shrink-0">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full rounded shadow" />
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm text-center p-2">
              Kapak yok
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{book.title}</h1>
          <p className="text-gray-600 mb-3">{book.authors.join(', ')}</p>

          {book.avgRating > 0 && (
            <p className="text-sm text-gray-500 mb-3">
              ⭐ {book.avgRating.toFixed(1)} ({book.ratingCount} değerlendirme)
            </p>
          )}

          {book.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {book.genres.map((g) => (
                <span key={g} className="text-xs bg-gray-100 px-2 py-1 rounded">{g}</span>
              ))}
            </div>
          )}

          {book.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{book.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
