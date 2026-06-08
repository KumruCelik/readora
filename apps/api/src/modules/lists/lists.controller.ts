import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

export async function createList(req: AuthRequest, res: Response) {
  try {
    const { title, description, isPublic } = req.body

    if (!title) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TITLE', message: 'Liste başlığı zorunlu' }
      })
    }

    const list = await prisma.bookList.create({
      data: {
        userId: req.userId!,
        title,
        description: description || null,
        isPublic: isPublic ?? true,
      },
      include: { books: true }
    })

    return res.status(201).json({ success: true, data: list })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getUserLists(req: Request, res: Response) {
  try {
    const { username } = req.params

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(404).json({ success: false })

    const lists = await prisma.bookList.findMany({
      where: {
        userId: user.id,
        isPublic: true,
      },
      include: {
        books: {
          include: {
            book: {
              select: { id: true, title: true, coverUrl: true, authors: true }
            }
          },
          orderBy: { order: 'asc' },
          take: 4,
        },
        _count: { select: { books: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.json({ success: true, data: lists })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getMyLists(req: AuthRequest, res: Response) {
  try {
    const lists = await prisma.bookList.findMany({
      where: { userId: req.userId! },
      include: {
        books: {
          include: {
            book: {
              select: { id: true, title: true, coverUrl: true, authors: true }
            }
          },
          orderBy: { order: 'asc' },
          take: 4,
        },
        _count: { select: { books: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.json({ success: true, data: lists })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getListById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const list = await prisma.bookList.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, avatar: true } },
        books: {
          include: {
            book: {
              select: {
                id: true, title: true, coverUrl: true,
                authors: true, avgRating: true, ratingCount: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: { select: { books: true } }
      }
    })

    if (!list) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Liste bulunamadı' }
      })
    }

    return res.json({ success: true, data: list })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function addBookToList(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { bookId, note } = req.body

    const list = await prisma.bookList.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!list) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Liste bulunamadı' }
      })
    }

    const count = await prisma.bookListItem.count({ where: { listId: id } })

    const item = await prisma.bookListItem.create({
      data: { listId: id, bookId, note: note || null, order: count },
      include: {
        book: { select: { id: true, title: true, coverUrl: true, authors: true } }
      }
    })

    return res.status(201).json({ success: true, data: item })

  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'Bu kitap zaten listede' }
      })
    }
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function removeBookFromList(req: AuthRequest, res: Response) {
  try {
    const { id, bookId } = req.params

    const list = await prisma.bookList.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!list) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Liste bulunamadı' }
      })
    }

    await prisma.bookListItem.deleteMany({
      where: { listId: id, bookId }
    })

    return res.json({ success: true, message: 'Kitap listeden çıkarıldı' })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function deleteList(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const list = await prisma.bookList.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!list) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Liste bulunamadı' }
      })
    }

    await prisma.bookList.delete({ where: { id } })

    return res.json({ success: true, message: 'Liste silindi' })

  } catch {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}