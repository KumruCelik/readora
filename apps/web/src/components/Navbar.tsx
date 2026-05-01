'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem('accessToken')
    router.push('/login')
  }

  const isLoggedIn = typeof window !== 'undefined' && 
    !!localStorage.getItem('accessToken')

  return (
    <nav className="bg-[#2D2D2D] text-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold text-[#E8694A]">
        📚 Readora
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/books/search" className="hover:text-[#E8694A] transition-colors">
          Kitaplar
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/profile" className="hover:text-[#E8694A] transition-colors">
              Profilim
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#E8694A] text-[#E8694A] hover:bg-[#E8694A] hover:text-white"
            >
              Çıkış
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-[#E8694A]">
                Giriş
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#E8694A] hover:bg-[#d4563a] text-white">
                Kayıt Ol
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}