import { Router } from 'express'
import {
  createReview,
  getBookReviews,
  updateReview,
  deleteReview,
  voteHelpful,
} from './reviews.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/book/:bookId',    getBookReviews)
router.post('/',               authMiddleware, createReview)
router.patch('/:id',           authMiddleware, updateReview)
router.delete('/:id',          authMiddleware, deleteReview)
router.post('/:id/helpful',    authMiddleware, voteHelpful)

export default router