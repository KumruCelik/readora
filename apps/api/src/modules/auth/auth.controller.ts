import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { generateAccessToken, generateRefreshToken } from '../../lib/jwt'
import { AuthRequest } from '../../middleware/auth'

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Tüm alanlar zorunlu' }
      })
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'Email veya kullanıcı adı zaten kullanımda' }
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
      select: { id: true, email: true, username: true, createdAt: true }
    })

    // Varsayılan rafları oluştur
    await prisma.shelf.createMany({
      data: [
        { userId: user.id, name: 'Okunacak',  isDefault: true },
        { userId: user.id, name: 'Okunuyor',  isDefault: true },
        { userId: user.id, name: 'Okundu',    isDefault: true },
      ]
    })

    const accessToken  = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    return res.status(201).json({
      success: true,
      data: { user, accessToken, refreshToken }
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Email ve şifre zorunlu' }
      })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Email veya şifre hatalı' }
      })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Email veya şifre hatalı' }
      })
    }

    const accessToken  = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    return res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, username: user.username },
        accessToken,
        refreshToken
      }
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' }
    })
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, username: true, bio: true, avatar: true, createdAt: true }
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
