import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './modules/auth/auth.router'
import booksRouter from './modules/books/books.router'
import usersRouter  from './modules/users/users.router'
import shelvesRouter from './modules/shelves/shelves.router'
import reviewsRouter from './modules/reviews/reviews.router'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/v1/auth',  authRouter)
app.use('/api/v1/books', booksRouter)
app.use('/api/v1/users',   usersRouter)
app.use('/api/v1/shelves', shelvesRouter)
app.use('/api/v1/reviews', reviewsRouter)

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Readora API çalışıyor 🚀',
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`✅ Readora API http://localhost:${PORT} adresinde çalışıyor`)
})