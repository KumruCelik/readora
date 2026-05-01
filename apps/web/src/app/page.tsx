import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-5xl font-bold mb-4">
        <span className="text-[#E8694A]">Readora</span>
      </h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md">
        Kitaplarını takip et, okuma listeni oluştur, yorumlarını paylaş.
      </p>
      <div className="flex gap-4">
        <Link href="/register">
          <Button>Ücretsiz Başla</Button>
        </Link>
        <Link href="/books/search">
          <Button variant="outline">Kitap Ara</Button>
        </Link>
      </div>
    </main>
  )
}
