import { Router } from 'express'
import {
  getShelves,
  createShelf,
  addBookToShelf,
  updateBookStatus,
  deleteShelf,
  updateShelf,
  removeBookFromShelf,
  getMyBookStatus,
} from './shelves.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/user/:userId',                   getShelves)
router.get('/books/:bookId/status',           authMiddleware, getMyBookStatus)
router.patch('/books/:bookId/status',         authMiddleware, updateBookStatus)
router.post('/',                              authMiddleware, createShelf)
router.post('/:shelfId/books',                authMiddleware, addBookToShelf)
router.delete('/:shelfId/books/:userBookId',  authMiddleware, removeBookFromShelf)
router.patch('/:shelfId',                     authMiddleware, updateShelf)
router.delete('/:shelfId',                    authMiddleware, deleteShelf)

export default router