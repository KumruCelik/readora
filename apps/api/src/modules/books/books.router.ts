import { Router } from 'express'
import { search, searchTurkish, getByISBN, getById } from './books.controller'

const router = Router()

router.get('/search/turkish', searchTurkish)  // ← önce bu
router.get('/search',         search)
router.get('/isbn/:isbn',     getByISBN)
router.get('/:id',            getById)

export default router