import { Router } from 'express'
import multer from 'multer'
import { getProfile, updateProfile, getStats, uploadAvatar } from './users.controller'
import { authMiddleware } from '../../middleware/auth'

const upload = multer({ dest: '/tmp/readora-uploads/' })

const router = Router()

router.get('/stats',              authMiddleware, getStats)
router.get('/:username',          getProfile)
router.patch('/me',               authMiddleware, updateProfile)
router.post('/me/avatar',         authMiddleware, upload.single('avatar'), uploadAvatar)

export default router