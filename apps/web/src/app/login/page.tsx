'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('accessToken', res.data.data.accessToken)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Email veya şifre hatalı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Hesabın yok mu?{' '}
          <Link href="/register" className="text-[#E8694A] hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  )
}
