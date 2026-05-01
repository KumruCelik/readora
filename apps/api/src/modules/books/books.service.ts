import axios from 'axios'
import redis from '../../lib/redis'
import { prisma } from '../../lib/prisma'

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1'
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY
const CACHE_TTL = 86400 // 24 saat

export async function searchBooks(query: string, limit = 10) {
  const cacheKey = `search:${query}:${limit}`

  // 1. Cache'e bak
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log('📦 Cache\'den geldi:', query)
    return JSON.parse(cached)
  }

  // 2. Google Books API'ye sor
  const response = await axios.get(`${GOOGLE_BOOKS_URL}/volumes`, {
    params: {
      q: query,
      maxResults: limit,
      key: API_KEY,
      langRestrict: 'tr',
    }
  })

  const books = response.data.items?.map(formatBook) || []

  // 3. Cache'e kaydet
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(books))

  // 4. Veritabanına kaydet
  for (const book of books) {
    await saveBookToDB(book)
  }

  return books
}

export async function getBookByISBN(isbn: string) {
  const cacheKey = `book:isbn:${isbn}`

  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Önce kendi DB'ye bak
  const dbBook = await prisma.book.findUnique({ where: { isbn } })
  if (dbBook) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(dbBook))
    return dbBook
  }

  // Yoksa Google'a sor
  const response = await axios.get(`${GOOGLE_BOOKS_URL}/volumes`, {
    params: { q: `isbn:${isbn}`, key: API_KEY }
  })

  const item = response.data.items?.[0]
  if (!item) return null

  const book = formatBook(item)
  const saved = await saveBookToDB(book)

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(saved))
  return saved
}

function formatBook(item: any) {
  const info = item.volumeInfo
  const isbn = info.industryIdentifiers?.find(
    (id: any) => id.type === 'ISBN_13'
  )?.identifier

  return {
    googleId:    item.id,
    isbn:        isbn || null,
    title:       info.title || 'Bilinmiyor',
    authors:     info.authors || [],
    genres:      info.categories || [],
    description: info.description || null,
    coverUrl:    info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    language:    info.language || 'tr',
    publishedAt: info.publishedDate ? new Date(info.publishedDate) : null,
  }
}

async function saveBookToDB(book: any) {
  return await prisma.book.upsert({
    where:  { isbn: book.isbn || `google_${book.googleId}` },
    update: { coverUrl: book.coverUrl, description: book.description },
    create: {
      isbn:        book.isbn || `google_${book.googleId}`,
      title:       book.title,
      authors:     book.authors,
      genres:      book.genres,
      description: book.description,
      coverUrl:    book.coverUrl,
      language:    book.language,
      publishedAt: book.publishedAt,
    }
  })
}
