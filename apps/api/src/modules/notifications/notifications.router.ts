import { Router } from 'express'
import {
  getNotifications,
  markAsRead,
  getUnreadCount,
} from './notifications.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/',              authMiddleware, getNotifications)
router.get('/unread-count',  authMiddleware, getUnreadCount)
router.patch('/:id/read',    authMiddleware, markAsRead)

export default router