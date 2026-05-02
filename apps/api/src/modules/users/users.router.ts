import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  getStats,
  setReadingGoal,
  getReadingGoal,
} from './users.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/stats',              authMiddleware, getStats)
router.get('/reading-goal',       authMiddleware, getReadingGoal)
router.post('/reading-goal',      authMiddleware, setReadingGoal)
router.get('/:username',          getProfile)
router.patch('/me',               authMiddleware, updateProfile)

export default router