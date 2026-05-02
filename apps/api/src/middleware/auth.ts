import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

export interface AuthRequest extends Request {
    userId?: string
    file?: Express.Multer.File
}

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Token bulunamadı' }
            })
        }

        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        req.userId = payload.userId
        next()

    } catch (err) {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Geçersiz token' }
        })
    }
}