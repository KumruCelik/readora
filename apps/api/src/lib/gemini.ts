import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function getBookRecommendations(readBooks: {
  title: string
  authors: string[]
  genres: string[]
}[]): Promise<{ title: string; author: string; reason: string }[]> {

  const bookList = readBooks
    .map(b => `- "${b.title}" by ${b.authors.join(', ')} (${b.genres.join(', ')})`)
    .join('\n')

  const prompt = `
Sen bir kitap öneri uzmanısın. Kullanıcının okuduğu kitaplara bakarak 8 kitap öner.

Kullanıcının okuduğu kitaplar:
${bookList}

Kurallar:
- Yukarıdaki kitapları önerme
- Türkçe veya dünya edebiyatından olabilir
- Her kitap için kısa bir öneri sebebi yaz (1 cümle, Türkçe)
- Sadece JSON döndür, başka hiçbir şey yazma

Format (tam olarak bu şekilde):
[
  {
    "title": "Kitap Adı",
    "author": "Yazar Adı",
    "reason": "Bu kitabı önermemizin sebebi"
  }
]
`

  const result = await geminiModel.generateContent(prompt)
  const text   = result.response.text()

  // JSON parse
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}