import { Response } from 'express'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      include: {
        actor: { select: { username: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 30
    })

    return res.json({ success: true, data: notifications })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    await prisma.notification.updateMany({
      where: id === 'all'
        ? { userId: req.userId! }
        : { id, userId: req.userId! },
      data: { isRead: true }
    })

    return res.json({ success: true })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response) {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.userId!, isRead: false }
    })

    return res.json({ success: true, data: { count } })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function createNotification({
  userId,
  type,
  message,
  actorId,
  bookId,
  reviewId,
}: {
  userId: string
  type: string
  message: string
  actorId?: string
  bookId?: string
  reviewId?: string
}) {
  if (userId === actorId) return

  await prisma.notification.create({
    data: { userId, type, message, actorId, bookId, reviewId }
  })
}
