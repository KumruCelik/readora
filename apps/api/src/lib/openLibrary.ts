import axios from 'axios'

const BASE_URL = 'https://openlibrary.org'

export async function searchOpenLibrary(query: string, limit = 10) {
  const response = await axios.get(`${BASE_URL}/search.json`, {
    params: {
      q: query,
      limit,
      language: 'tur',
      fields: 'key,title,author_name,isbn,cover_i,subject,first_publish_year'
    }
  })

  return response.data.docs?.map(formatOLBook) || []
}

export async function getOLBookByISBN(isbn: string) {
  const response = await axios.get(`${BASE_URL}/isbn/${isbn}.json`)
  return response.data
}

function formatOLBook(doc: any) {
  const isbn = doc.isbn?.[0] || null

  return {
    googleId:    null,
    openLibraryId: doc.key?.replace('/works/', '') || null,
    isbn,
    title:       doc.title || 'Bilinmiyor',
    authors:     doc.author_name || [],
    genres:      doc.subject?.slice(0, 3) || [],
    description: null,
    coverUrl:    doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
    language:    'tr',
    publishedAt: doc.first_publish_year
      ? new Date(`${doc.first_publish_year}-01-01`)
      : null,
  }
}