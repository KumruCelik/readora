import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { AuthRequest } from '../../middleware/auth'

export async function getShelves(req: Request, res: Response) {
  try {
    const { userId } = req.params

    const shelves = await prisma.shelf.findMany({
      where: { userId },
      include: {
        shelfBooks: {
          include: {
            userBook: {
              include: { book: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return res.json({ success: true, data: shelves })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function createShelf(req: AuthRequest, res: Response) {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_NAME', message: 'Raf adı zorunlu' }
      })
    }

    const shelf = await prisma.shelf.create({
      data: {
        userId: req.userId!,
        name,
        description,
        isDefault: false,
      }
    })

    return res.status(201).json({ success: true, data: shelf })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function addBookToShelf(req: AuthRequest, res: Response) {
  try {
    const { shelfId } = req.params
    const { bookId } = req.body

    // Raf kullanıcıya ait mi?
    const shelf = await prisma.shelf.findFirst({
      where: { id: shelfId, userId: req.userId }
    })

    if (!shelf) {
      return res.status(404).json({
        success: false,
        error: { code: 'SHELF_NOT_FOUND', message: 'Raf bulunamadı' }
      })
    }

    // UserBook oluştur veya bul
    const userBook = await prisma.userBook.upsert({
      where: {
        userId_bookId: { userId: req.userId!, bookId }
      },
      create: {
        userId: req.userId!,
        bookId,
        status: 'WANT_TO_READ'
      },
      update: {}
    })

    // Rafa ekle
    const shelfBook = await prisma.shelfBook.upsert({
      where: {
        shelfId_userBookId: {
          shelfId,
          userBookId: userBook.id
        }
      },
      create: { shelfId, userBookId: userBook.id },
      update: {}
    })

    return res.status(201).json({ success: true, data: shelfBook })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function updateBookStatus(req: AuthRequest, res: Response) {
  try {
    const { bookId } = req.params
    const { status } = req.body

    const validStatuses = ['WANT_TO_READ', 'READING', 'READ']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Geçersiz durum' }
      })
    }

    const userBook = await prisma.userBook.upsert({
      where: {
        userId_bookId: { userId: req.userId!, bookId }
      },
      create: {
        userId: req.userId!,
        bookId,
        status,
        finishedAt: status === 'READ' ? new Date() : null,
        startedAt: status === 'READING' ? new Date() : null,
      },
      update: {
        status,
        finishedAt: status === 'READ' ? new Date() : null,
        startedAt: status === 'READING' ? new Date() : null,
      }
    })

    return res.json({ success: true, data: userBook })

  } catch (err) {
    console.error('updateBookStatus hatası:', err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function deleteShelf(req: AuthRequest, res: Response) {
  try {
    const { shelfId } = req.params

    const shelf = await prisma.shelf.findFirst({
      where: { id: shelfId, userId: req.userId }
    })

    if (!shelf) {
      return res.status(404).json({
        success: false,
        error: { code: 'SHELF_NOT_FOUND', message: 'Raf bulunamadı' }
      })
    }

    if (shelf.isDefault) {
      return res.status(400).json({
        success: false,
        error: { code: 'DEFAULT_SHELF', message: 'Varsayılan raflar silinemez' }
      })
    }

    await prisma.shelf.delete({ where: { id: shelfId } })

    return res.json({ success: true, message: 'Raf silindi' })

  } catch (err) {
    console.error('deleteShelf hatası:', err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function updateShelf(req: AuthRequest, res: Response) {
  try {
    const { shelfId } = req.params
    const { name, description } = req.body

    const shelf = await prisma.shelf.findFirst({
      where: { id: shelfId, userId: req.userId }
    })

    if (!shelf) {
      return res.status(404).json({
        success: false,
        error: { code: 'SHELF_NOT_FOUND', message: 'Raf bulunamadı' }
      })
    }

    const updated = await prisma.shelf.update({
      where: { id: shelfId },
      data: { name, description }
    })

    return res.json({ success: true, data: updated })

  } catch (err) {
    console.error('updateShelf hatası:', err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function removeBookFromShelf(req: AuthRequest, res: Response) {
  try {
    const { shelfId, userBookId } = req.params

    const shelf = await prisma.shelf.findFirst({
      where: { id: shelfId, userId: req.userId }
    })

    if (!shelf) {
      return res.status(404).json({
        success: false,
        error: { code: 'SHELF_NOT_FOUND', message: 'Raf bulunamadı' }
      })
    }

    await prisma.shelfBook.delete({
      where: {
        shelfId_userBookId: { shelfId, userBookId }
      }
    })

    return res.json({ success: true, message: 'Kitap raftan çıkarıldı' })

  } catch (err) {
    console.error('removeBookFromShelf hatası:', err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function getMyBookStatus(req: AuthRequest, res: Response) {
  try {
    const { bookId } = req.params

    const userBook = await prisma.userBook.findUnique({
      where: {
        userId_bookId: { userId: req.userId!, bookId }
      }
    })

    return res.json({ success: true, data: userBook })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}