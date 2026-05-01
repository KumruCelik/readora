import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './modules/auth/auth.router'
import booksRouter from './modules/books/books.router'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/v1/auth',  authRouter)
app.use('/api/v1/books', booksRouter)

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