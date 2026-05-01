import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRES_IN = '15m'
const REFRESH_EXPIRES_IN = '7d'

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN
  })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}
