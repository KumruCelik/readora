import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'
import cloudinary from '../../lib/cloudinary'

export async function uploadAvatar(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'Dosya bulunamadı' }
      })
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'readora/avatars',
      width: 200,
      height: 200,
      crop: 'fill',
    })

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: result.secure_url },
      select: { id: true, username: true, avatar: true }
    })

    return res.json({ success: true, data: user })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const { username } = req.params

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            userBooks: true,
            reviews: true,
            followers: true,
            following: true,
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Kullanıcı bulunamadı' }
      })
    }

    return res.json({ success: true, data: user })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { bio, avatar } = req.body

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { bio, avatar },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
      }
    })

    return res.json({ success: true, data: user })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!

    const [totalBooks, readBooks, reviews, genres] = await Promise.all([
      prisma.userBook.count({ where: { userId } }),
      prisma.userBook.count({ where: { userId, status: 'READ' } }),
      prisma.review.count({ where: { userId } }),
      prisma.userBook.findMany({
        where: { userId, status: 'READ' },
        include: { book: { select: { genres: true } } }
      })
    ])

    // En çok okunan tür
    const genreCount: Record<string, number> = {}
    genres.forEach(ub => {
      ub.book.genres.forEach(g => {
        genreCount[g] = (genreCount[g] || 0) + 1
      })
    })
    const topGenre = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null

    return res.json({
      success: true,
      data: { totalBooks, readBooks, reviews, topGenre }
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}