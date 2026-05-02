import { prisma } from './prisma'

// ISBN-10'dan ISBN-13'e dönüştür
export function normalizeISBN(isbn: string): string {
  isbn = isbn.replace(/[-\s]/g, '')

  if (isbn.length === 13) return isbn

  if (isbn.length === 10) {
    const base = '978' + isbn.slice(0, 9)
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3)
    }
    const check = (10 - (sum % 10)) % 10
    return base + check
  }

  return isbn
}

// Kitap eşleştirme algoritması
export async function findOrCreateBook(bookData: any) {
  // 1. ISBN varsa direkt ara
  if (bookData.isbn) {
    const normalized = normalizeISBN(bookData.isbn)
    const existing = await prisma.book.findUnique({
      where: { isbn: normalized }
    })
    if (existing) return existing
  }

  // 2. googleId ile ara
  if (bookData.googleId) {
    const existing = await prisma.book.findUnique({
      where: { googleId: bookData.googleId }
    })
    if (existing) return existing
  }

  // 3. Fuzzy match — aynı başlık + yazar
  if (bookData.title && bookData.authors?.length > 0) {
    const fuzzy = await prisma.book.findFirst({
      where: {
        title: { contains: bookData.title, mode: 'insensitive' },
        authors: { hasSome: bookData.authors }
      }
    })
    if (fuzzy) return fuzzy
  }

  // 4. Hiç eşleşme yoksa upsert ile oluştur (duplicate hatası önle)
  const isbn = bookData.isbn ? normalizeISBN(bookData.isbn) : null
  const isbnKey = isbn || (bookData.googleId ? `google_${bookData.googleId}` : null)

  return await prisma.book.upsert({
    where: {
      isbn: isbnKey ?? `unknown_${Date.now()}`
    },
    create: {
      googleId:    bookData.googleId || null,
      isbn:        isbnKey,
      title:       bookData.title,
      authors:     bookData.authors || [],
      genres:      bookData.genres || [],
      description: bookData.description || null,
      coverUrl:    bookData.coverUrl || null,
      language:    bookData.language || 'tr',
      publishedAt: bookData.publishedAt || null,
    },
    update: {
      coverUrl:    bookData.coverUrl || undefined,
      description: bookData.description || undefined,
    }
  })
}