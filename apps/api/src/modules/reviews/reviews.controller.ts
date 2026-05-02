import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

export async function createReview(req: AuthRequest, res: Response) {
  try {
    const { bookId, rating, content, hasSpoiler } = req.body

    if (!bookId || !rating) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Kitap ID ve puan zorunlu' }
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_RATING', message: 'Puan 1-5 arasında olmalı' }
      })
    }

    // Daha önce yorum yapmış mı?
    const existing = await prisma.review.findFirst({
      where: { userId: req.userId!, bookId }
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'REVIEW_EXISTS', message: 'Bu kitaba zaten yorum yaptın' }
      })
    }

    const review = await prisma.review.create({
      data: {
        userId:     req.userId!,
        bookId,
        rating,
        content:    content || '',
        hasSpoiler: hasSpoiler || false,
      },
      include: {
        user: { select: { username: true, avatar: true } }
      }
    })

    // Kitabın ortalama puanını güncelle
    await updateBookRating(bookId)

    // Kitabı "Okudum" olarak işaretle
    await prisma.userBook.upsert({
      where: { userId_bookId: { userId: req.userId!, bookId } },
      create: { userId: req.userId!, bookId, status: 'READ' },
      update: { status: 'READ' }
    })

    return res.status(201).json({ success: true, data: review })

  } catch (err) {
    console.error('createReview hatası:', err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getBookReviews(req: Request, res: Response) {
  try {
    const { bookId } = req.params
    const { sort = 'recent', page = '1' } = req.query

    const orderBy = sort === 'helpful'
      ? { helpful: 'desc' as const }
      : { createdAt: 'desc' as const }

    const reviews = await prisma.review.findMany({
      where: { bookId },
      include: {
        user: { select: { username: true, avatar: true } }
      },
      orderBy,
      take: 20,
      skip: (parseInt(page as string) - 1) * 20
    })

    const total = await prisma.review.count({ where: { bookId } })

    return res.json({
      success: true,
      data: reviews,
      meta: { total, page: parseInt(page as string) }
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function updateReview(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { rating, content, hasSpoiler } = req.body

    const review = await prisma.review.findFirst({
      where: { id, userId: req.userId }
    })

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Yorum bulunamadı' }
      })
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { rating, content, hasSpoiler },
      include: {
        user: { select: { username: true, avatar: true } }
      }
    })

    await updateBookRating(review.bookId)

    return res.json({ success: true, data: updated })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function deleteReview(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const review = await prisma.review.findFirst({
      where: { id, userId: req.userId }
    })

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Yorum bulunamadı' }
      })
    }

    await prisma.review.delete({ where: { id } })
    await updateBookRating(review.bookId)

    return res.json({ success: true, message: 'Yorum silindi' })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function voteHelpful(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const review = await prisma.review.update({
      where: { id },
      data: { helpful: { increment: 1 } }
    })

    return res.json({ success: true, data: { helpful: review.helpful } })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

// Kitabın ortalama puanını güncelle
async function updateBookRating(bookId: string) {
  const result = await prisma.review.aggregate({
    where: { bookId },
    _avg: { rating: true },
    _count: { rating: true }
  })

  await prisma.book.update({
    where: { id: bookId },
    data: {
      avgRating:   result._avg.rating || 0,
      ratingCount: result._count.rating
    }
  })
}