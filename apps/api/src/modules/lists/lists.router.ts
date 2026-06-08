import { Router } from 'express'
import {
  createList,
  getUserLists,
  getMyLists,
  getListById,
  addBookToList,
  removeBookFromList,
  deleteList,
} from './lists.controller'
import { authMiddleware } from '../../middleware/auth'

const router = Router()

router.get('/my',                      authMiddleware, getMyLists)
router.post('/',                       authMiddleware, createList)
router.get('/user/:username',          getUserLists)
router.get('/:id',                     getListById)
router.post('/:id/books',              authMiddleware, addBookToList)
router.delete('/:id/books/:bookId',    authMiddleware, removeBookFromList)
router.delete('/:id',                  authMiddleware, deleteList)

export default router