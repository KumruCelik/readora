import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  getStats,
  setReadingGoal,
  getReadingGoal,
  followUser,
  getFollowers,
  getFollowing,
  isFollowing,
  getActivityFeed,
  getDetailedStats,
} from './users.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/feed',                     authMiddleware, getActivityFeed)
router.get('/detailed-stats',           authMiddleware, getDetailedStats)
router.get('/stats',                    authMiddleware, getStats)
router.get('/reading-goal',             authMiddleware, getReadingGoal)
router.post('/reading-goal',            authMiddleware, setReadingGoal)
router.post('/:username/follow',        authMiddleware, followUser)
router.get('/:username/followers',      getFollowers)
router.get('/:username/following',      getFollowing)
router.get('/:username/is-following',   authMiddleware, isFollowing)
router.get('/:username',                getProfile)
router.patch('/me',                     authMiddleware, updateProfile)

export default router
