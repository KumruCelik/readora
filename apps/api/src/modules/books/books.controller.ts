import { Request, Response } from 'express'
import { searchBooks, getBookByISBN } from './books.service'
import { prisma } from '../../lib/prisma'

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

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}
