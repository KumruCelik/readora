import { Router } from 'express'
import { search, searchTurkish, getByISBN, getById, getRecommendations } from './books.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/search/turkish',   searchTurkish)
router.get('/search',           search)
router.get('/recommendations',  authMiddleware, getRecommendations)
router.get('/isbn/:isbn',       getByISBN)
router.get('/:id',              getById)

export default router