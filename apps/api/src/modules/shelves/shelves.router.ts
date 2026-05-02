import { Router } from 'express'
import {
  getShelves,
  createShelf,
  addBookToShelf,
  updateBookStatus
} from './shelves.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/user/:userId',           getShelves)
router.post('/',          authMiddleware, createShelf)
router.post('/:shelfId/books', authMiddleware, addBookToShelf)
router.patch('/books/:bookId/status', authMiddleware, updateBookStatus)

export default router