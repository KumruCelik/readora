'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

interface User {
  id: string
  username: string
  bio: string | null
  avatar: string | null
  createdAt: string
  _count: {
    userBooks: number
    reviews: number
    followers: number
    following: number
  }
}

interface Stats {
  totalBooks: number
  readBooks: number
  reviews: number
  topGenre: string | null
}

interface Shelf {
  id: string
  name: string
  isDefault: boolean
  shelfBooks: { id: string }[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const [meRes, statsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/users/stats'),
      ])
      setUser(meRes.data.data)
      setStats(statsRes.data.data)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [fetchProfile, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#E8694A] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2D2D2D]">@{user.username}</h1>
              <p className="text-gray-500 mt-1">
                {user.bio || 'Henüz bir biyografi eklenmemiş.'}
              </p>
            </div>
          </div>

          <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2D2D2D]">{user._count?.following ?? 0}</p>
              <p className="text-sm text-gray-500">Takip Edilen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2D2D2D]">{user._count?.followers ?? 0}</p>
              <p className="text-sm text-gray-500">Takipçi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2D2D2D]">{user._count?.reviews ?? 0}</p>
              <p className="text-sm text-gray-500">Yorum</p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Toplam Kitap', value: stats.totalBooks, emoji: '📚' },
              { label: 'Okunan',       value: stats.readBooks,  emoji: '✅' },
              { label: 'Yorum',        value: stats.reviews,    emoji: '💬' },
              { label: 'Favori Tür',   value: stats.topGenre || '—', emoji: '🏷️' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-2xl mb-1">{s.emoji}</div>
                <p className="text-xl font-bold text-[#2D2D2D]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <ReadingGoalSection />
        <ShelvesSection userId={user.id} />
      </div>
    </div>
  )
}

function ReadingGoalSection() {
  const [goal, setGoal]         = useState<number | null>(null)
  const [readCount, setReadCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [newGoal, setNewGoal]   = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchGoal()
  }, [])

  async function fetchGoal() {
    try {
      const res = await api.get('/users/reading-goal')
      const data = res.data.data
      setGoal(data.goal)
      setReadCount(data.readCount)
      setProgress(data.progress)
    } finally {
      setLoading(false)
    }
  }

  async function handleSetGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!newGoal) return
    try {
      await api.post('/users/reading-goal', { goal: parseInt(newGoal) })
      setGoal(parseInt(newGoal))
      setNewGoal('')
      fetchGoal()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">
        🎯 Yıllık Okuma Hedefi ({new Date().getFullYear()})
      </h2>

      {goal ? (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{readCount} kitap okundu</span>
            <span>Hedef: {goal} kitap</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
            <div
              className="bg-[#E8694A] h-4 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            %{progress} tamamlandı
            {progress >= 100 && ' 🎉 Hedefine ulaştın!'}
          </p>
        </div>
      ) : (
        <p className="text-gray-400 text-sm mb-4">Henüz hedef belirlemedin.</p>
      )}

      <form onSubmit={handleSetGoal} className="flex gap-2 mt-4">
        <input
          type="number"
          placeholder="Bu yıl kaç kitap okuyacaksın?"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          min={1}
          max={365}
          className="flex-1 h-10 px-3 rounded-md border border-gray-300 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#E8694A] text-white rounded-md text-sm hover:bg-[#d4563a]"
        >
          {goal ? 'Güncelle' : 'Hedef Belirle'}
        </button>
      </form>
    </div>
  )
}

function ShelvesSection({ userId }: { userId: string }) {
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [newShelfName, setNewShelfName] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchShelves = useCallback(async () => {
    try {
      const res = await api.get(`/shelves/user/${userId}`)
      setShelves(res.data.data)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchShelves()
  }, [fetchShelves])

  async function createShelf(e: React.FormEvent) {
    e.preventDefault()
    if (!newShelfName.trim()) return
    try {
      await api.post('/shelves', { name: newShelfName })
      setNewShelfName('')
      fetchShelves()
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteShelf(shelfId: string) {
    try {
      await api.delete(`/shelves/${shelfId}`)
      fetchShelves()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-gray-400">Raflar yükleniyor...</p>

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">📚 Raflarım</h2>

      <form onSubmit={createShelf} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Yeni raf adı..."
          value={newShelfName}
          onChange={(e) => setNewShelfName(e.target.value)}
          className="flex-1 h-10 px-3 rounded-md border border-gray-300 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#E8694A] text-white rounded-md text-sm hover:bg-[#d4563a]"
        >
          Raf Ekle
        </button>
      </form>

      <div className="space-y-3">
        {shelves.map((shelf) => (
          <div key={shelf.id}
            className="flex items-center justify-between p-3 bg-[#FAF7F2] rounded-lg">
            <div>
              <p className="font-medium text-[#2D2D2D]">{shelf.name}</p>
              <p className="text-xs text-gray-500">{shelf.shelfBooks?.length || 0} kitap</p>
            </div>
            {!shelf.isDefault && (
              <button
                onClick={() => deleteShelf(shelf.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Sil
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}