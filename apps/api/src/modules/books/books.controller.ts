import { Request, Response } from 'express'
import { searchBooks, getBookByISBN, searchTurkishBooks } from './books.service'
import { prisma } from '../../lib/prisma'
import { getBookRecommendations } from '../../lib/gemini'
import { AuthRequest } from '../../middleware/auth'

export async function search(req: Request, res: Response) {
  try {
    const { q, limit } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUERY', message: 'Arama terimi gerekli' }
      })
    }

    const books = await searchBooks(
      q as string,
      limit ? parseInt(limit as string) : 10
    )

    return res.json({ success: true, data: books })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function searchTurkish(req: Request, res: Response) {
  try {
    const { q, limit } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUERY', message: 'Arama terimi gerekli' }
      })
    }

    const books = await searchTurkishBooks(
      q as string,
      limit ? parseInt(limit as string) : 10
    )

    return res.json({ success: true, data: books })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getByISBN(req: Request, res: Response) {
  try {
    const { isbn } = req.params
    const book = await getBookByISBN(isbn)

    if (!book) {
      return res.status(404).json({
        success: false,
        error: { code: 'BOOK_NOT_FOUND', message: 'Kitap bulunamadı' }
      })
    }

    return res.json({ success: true, data: book })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { username: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!book) {
      return res.status(404).json({
        success: false,
        error: { code: 'BOOK_NOT_FOUND', message: 'Kitap bulunamadı' }
      })
    }

    return res.json({ success: true, data: book })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getRecommendations(req: AuthRequest, res: Response) {
  try {
    const userBooks = await prisma.userBook.findMany({
      where: {
        userId: req.userId!,
        status: { in: ['READ', 'READING'] }
      },
      include: {
        book: { select: { title: true, authors: true, genres: true } }
      },
      take: 20,
      orderBy: { updatedAt: 'desc' }
    })

    let readBooks = userBooks.map(ub => ub.book)
    let meta = { reason: 'personalized', message: 'Okuma geçmişine göre öneriler' }

    if (readBooks.length < 3) {
      const popular = await prisma.book.findMany({
        select: { title: true, authors: true, genres: true },
        orderBy: { ratingCount: 'desc' },
        take: 10
      })
      readBooks = [...readBooks, ...popular]
      meta = { reason: 'popular', message: 'Popüler kitaplara göre öneriler' }
    }

    const recommendations = await getBookRecommendations(readBooks)

    const { default: axios } = await import('axios')
    const { findOrCreateBook } = await import('../../lib/isbn')

    const enriched = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const query = encodeURIComponent(`${rec.title} ${rec.author}`)
          const gbRes = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&key=${process.env.GOOGLE_BOOKS_API_KEY}`
          )
          const item = gbRes.data.items?.[0]
          if (!item) return { ...rec, book: null }

          const info = item.volumeInfo
          const book = await findOrCreateBook({
            googleId:    item.id,
            isbn:        info.industryIdentifiers?.find((i: { type: string; identifier: string }) => i.type === 'ISBN_13')?.identifier,
            title:       info.title,
            authors:     info.authors || [rec.author],
            genres:      info.categories || [],
            description: info.description,
            coverUrl:    info.imageLinks?.thumbnail?.replace('http://', 'https://'),
            language:    info.language || 'tr',
            publishedAt: info.publishedDate ? new Date(info.publishedDate) : null,
          })

          return { ...rec, book }
        } catch {
          return { ...rec, book: null }
        }
      })
    )

    return res.json({
      success: true,
      data: enriched.filter(r => r.book !== null),
      meta
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Öneri alınamadı' }
    })
  }
}
