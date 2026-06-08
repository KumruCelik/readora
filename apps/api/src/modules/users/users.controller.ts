import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'
import cloudinary from '../../lib/cloudinary'
import redis from '../../lib/redis'
import { createNotification } from '../notifications/notifications.controller'

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

export async function setReadingGoal(req: AuthRequest, res: Response) {
  try {
    const { goal, year } = req.body

    if (!goal || goal < 1 || goal > 365) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_GOAL', message: 'Hedef 1-365 arasında olmalı' }
      })
    }

    const currentYear = year || new Date().getFullYear()

    // User tablosuna goal alanı ekleyeceğiz
    // Şimdilik Redis'te saklayalım
    await redis.set(
      `reading_goal:${req.userId}:${currentYear}`,
      JSON.stringify({ goal, year: currentYear })
    )

    return res.json({
      success: true,
      data: { goal, year: currentYear }
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getReadingGoal(req: AuthRequest, res: Response) {
  try {
    const year = req.query.year || new Date().getFullYear()

    const cached = await redis.get(`reading_goal:${req.userId}:${year}`)
    const goalData = cached ? JSON.parse(cached) : null

    // Bu yıl okunan kitap sayısı
    const startOfYear = new Date(`${year}-01-01`)
    const endOfYear   = new Date(`${year}-12-31`)

    const readCount = await prisma.userBook.count({
      where: {
        userId: req.userId,
        status: 'READ',
        finishedAt: { gte: startOfYear, lte: endOfYear }
      }
    })

    return res.json({
      success: true,
      data: {
        goal:      goalData?.goal || null,
        year:      Number(year),
        readCount,
        progress:  goalData?.goal ? Math.round((readCount / goalData.goal) * 100) : 0
      }
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function followUser(req: AuthRequest, res: Response) {
  try {
    const { username } = req.params

    const target = await prisma.user.findUnique({ where: { username } })
    if (!target) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Kullanıcı bulunamadı' }
      })
    }

    if (target.id === req.userId) {
      return res.status(400).json({
        success: false,
        error: { code: 'SELF_FOLLOW', message: 'Kendini takip edemezsin' }
      })
    }

    const existing = await prisma.follow.findFirst({
      where: { followerId: req.userId!, followingId: target.id }
    })

    if (existing) {
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId: req.userId!, followingId: target.id } }
      })
      return res.json({ success: true, data: { following: false } })
    }

    await prisma.follow.create({
      data: { followerId: req.userId!, followingId: target.id }
    })

    await createNotification({
      userId:  target.id,
      type:    'FOLLOW',
      message: `@${req.userId} seni takip etmeye başladı`,
      actorId: req.userId!,
    })

    return res.json({ success: true, data: { following: true } })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getFollowers(req: Request, res: Response) {
  try {
    const { username } = req.params

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(404).json({ success: false })

    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: { id: true, username: true, avatar: true, bio: true }
        }
      }
    })

    return res.json({ success: true, data: followers.map(f => f.follower) })

  } catch (err) {
    return res.status(500).json({ success: false })
  }
}

export async function getFollowing(req: Request, res: Response) {
  try {
    const { username } = req.params

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(404).json({ success: false })

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: { id: true, username: true, avatar: true, bio: true }
        }
      }
    })

    return res.json({ success: true, data: following.map(f => f.following) })

  } catch (err) {
    return res.status(500).json({ success: false })
  }
}

export async function isFollowing(req: AuthRequest, res: Response) {
  try {
    const { username } = req.params

    const target = await prisma.user.findUnique({ where: { username } })
    if (!target) return res.status(404).json({ success: false })

    const existing = await prisma.follow.findFirst({
      where: { followerId: req.userId!, followingId: target.id }
    })

    return res.json({ success: true, data: { following: !!existing } })

  } catch (err) {
    return res.status(500).json({ success: false })
  }
}

export async function getActivityFeed(req: AuthRequest, res: Response) {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: req.userId! },
      select: { followingId: true }
    })

    const followingIds = following.map(f => f.followingId)

    if (followingIds.length === 0) {
      return res.json({ success: true, data: [] })
    }

    const [reviews, shelfUpdates] = await Promise.all([
      prisma.review.findMany({
        where: { userId: { in: followingIds } },
        include: {
          user: { select: { username: true, avatar: true } },
          book: { select: { id: true, title: true, coverUrl: true, authors: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.userBook.findMany({
        where: { userId: { in: followingIds } },
        include: {
          user: { select: { username: true, avatar: true } },
          book: { select: { id: true, title: true, coverUrl: true, authors: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 20
      })
    ])

    const feed = [
      ...reviews.map(r => ({
        type: 'review',
        id: r.id,
        user: r.user,
        book: r.book,
        rating: r.rating,
        content: r.content,
        createdAt: r.createdAt,
      })),
      ...shelfUpdates.map(s => ({
        type: 'shelf',
        id: s.id,
        user: s.user,
        book: s.book,
        status: s.status,
        createdAt: s.updatedAt,
      }))
    ].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 30)

    return res.json({ success: true, data: feed })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}