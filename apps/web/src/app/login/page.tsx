'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useBookSearch } from '@/components/BookSearchModal'

const genres = ['Sanat', 'Biyografi', 'Klasikler', 'Çizgi Roman', 'Kurgu', 'Tarih']

const footerLinkStyle = { fontSize: 13, color: '#9DB5A4', cursor: 'pointer' }

export default function LoginPage() {
  const router = useRouter()
  const { openSearch } = useBookSearch()
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthNotice, setOauthNotice] = useState('')

  function showOauthNotice(provider: string) {
    setOauthNotice(`${provider} ile kayıt yakında aktif olacak 🚧`)
    setTimeout(() => setOauthNotice(''), 3000)
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form
      const res = await api.post(endpoint, payload)
      localStorage.setItem('accessToken', res.data.data.accessToken)
      router.push('/')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setError(e.response?.data?.error?.message || (mode === 'login' ? 'Email veya şifre hatalı.' : 'Bir hata oluştu.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#faf9f6' }}>
      {/* Top Nav */}
      <nav className="w-full sticky top-0 z-50" style={{ backgroundColor: '#faf9f6', borderBottom: '1px solid #e8e8e5' }}>
        <div className="max-w-desktop mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#446651' }}>
              📚 Readora
            </span>
            <div className="hidden md:flex gap-6 items-center">
              <button onClick={openSearch} style={{ fontSize: 13, fontWeight: 700, color: '#446651', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid #446651', paddingBottom: 4, background: 'none', cursor: 'pointer' }}>
                Keşfet
              </button>
              <Link href="/lists" style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
                Okuma Listeleri
              </Link>
              <Link href="/clubs" style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
                Kulüpler
              </Link>
              <span style={{ fontSize: 13, color: '#424843', fontWeight: 500 }}>
                Topluluk
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => switchMode('login')}
              style={{ fontSize: 13, fontWeight: 700, color: '#446651', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => switchMode('register')}
              style={{ backgroundColor: '#446651', color: 'white', borderRadius: 999, padding: '8px 20px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Üye Ol
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #446651 0%, #7B9E87 100%)' }}>
          <div className="max-w-desktop mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left content */}
            <div className="lg:col-span-7 text-white">
              <h1 className="mb-6 leading-tight" style={{ fontFamily: 'serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700 }}>
                Yaz&apos;ın Büyük Kitapları<br />(ve Sonrası!)
              </h1>
              <p className="mb-8 max-w-xl" style={{ fontSize: 17, opacity: 0.9, lineHeight: 1.7 }}>
                Editörlerimizin seçtiği en iyi kitapları keşfedin, okuma hedeflerinizi belirleyin ve benzer düşünen okurlarla bir araya gelin.
              </p>
              <button onClick={openSearch} className="inline-flex items-center gap-2" style={{ backgroundColor: 'white', color: '#446651', padding: '14px 28px', borderRadius: 999, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                Daha Fazlasını Keşfet <span>→</span>
              </button>
            </div>

            {/* Right auth card */}
            <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-2xl shadow-sm" style={{ border: '1px solid #e8e8e5' }}>
                <h2 className="mb-6" style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, color: '#446651' }}>
                  {mode === 'register' ? 'Daha fazlasını keşfedin ve okuyun' : 'Tekrar hoş geldiniz'}
                </h2>

                {error && (
                  <div className="mb-4" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, borderRadius: 8, padding: '10px 14px' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {mode === 'register' && (
                    <input
                      type="text"
                      placeholder="Kullanıcı adı"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full bg-transparent py-3 focus:outline-none transition-colors"
                      style={{ borderBottom: '1px solid #c1c8c1', fontSize: 15, color: '#2D2D2D' }}
                    />
                  )}
                  <input
                    type="email"
                    placeholder="E-posta adresi"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent py-3 focus:outline-none transition-colors"
                    style={{ borderBottom: '1px solid #c1c8c1', fontSize: 15, color: '#2D2D2D' }}
                  />
                  <input
                    type="password"
                    placeholder="Şifre"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-transparent py-3 focus:outline-none transition-colors"
                    style={{ borderBottom: '1px solid #c1c8c1', fontSize: 15, color: '#2D2D2D' }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2"
                    style={{ backgroundColor: '#446651', color: 'white', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Lütfen bekleyin...' : mode === 'register' ? 'E-posta ile Kaydol' : 'Giriş Yap'}
                  </button>
                </form>

                {mode === 'register' && (
                  <>
                    <div className="mt-6 flex items-center gap-2">
                      <div className="flex-1 h-px" style={{ backgroundColor: '#e8e8e5' }} />
                      <span style={{ fontSize: 12, color: '#9DB5A4' }}>veya</span>
                      <div className="flex-1 h-px" style={{ backgroundColor: '#e8e8e5' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => showOauthNotice('Google')}
                        className="flex items-center justify-center gap-2"
                        style={{ border: '1px solid #c1c8c1', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 600, color: '#424843', backgroundColor: 'white', cursor: 'pointer' }}
                      >
                        <span style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#446651', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>G</span>
                        Google
                      </button>
                      <button
                        type="button"
                        onClick={() => showOauthNotice('Facebook')}
                        className="flex items-center justify-center gap-2"
                        style={{ border: '1px solid #c1c8c1', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 600, color: '#424843', backgroundColor: 'white', cursor: 'pointer' }}
                      >
                        <span style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#7B9E87', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>f</span>
                        Facebook
                      </button>
                    </div>
                    {oauthNotice && (
                      <p className="mt-3 text-center" style={{ fontSize: 12, color: '#446651' }}>{oauthNotice}</p>
                    )}
                  </>
                )}

                <p className="mt-6 text-center" style={{ fontSize: 13, color: '#9DB5A4' }}>
                  {mode === 'register' ? (
                    <>
                      Zaten hesabın var mı?{' '}
                      <button onClick={() => switchMode('login')} style={{ color: '#446651', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Giriş yap
                      </button>
                    </>
                  ) : (
                    <>
                      Hesabın yok mu?{' '}
                      <button onClick={() => switchMode('register')} style={{ color: '#446651', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Kayıt ol
                      </button>
                    </>
                  )}
                </p>

                {mode === 'register' && (
                  <p className="mt-6 text-center leading-relaxed" style={{ fontSize: 12, color: '#9DB5A4' }}>
                    Kaydolarak Kullanım Şartları&apos;nı ve Gizlilik Politikası&apos;nı kabul etmiş olursunuz.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="py-16" style={{ backgroundColor: '#faf9f6', borderBottom: '1px solid #e8e8e5' }}>
          <div className="max-w-desktop mx-auto px-4 md:px-8 text-center">
            <h2 className="mb-8" style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, color: '#446651' }}>
              Kitapları arayın ve inceleyin
            </h2>
            <button onClick={openSearch} className="max-w-2xl mx-auto relative flex items-center w-full" style={{ display: 'flex' }}>
              <span
                className="w-full bg-white"
                style={{ border: '1px solid #c1c8c1', padding: '16px 64px 16px 24px', borderRadius: 999, fontSize: 14, color: '#9DB5A4', textAlign: 'left' }}
              >
                Başlık, yazar veya ISBN&apos;e göre ara
              </span>
              <span
                className="absolute flex items-center justify-center"
                style={{ right: 8, top: 8, backgroundColor: '#446651', color: 'white', borderRadius: '50%', width: 44, height: 44, fontSize: 16 }}
              >
                🔍
              </span>
            </button>
            <div className="mt-8 flex flex-wrap justify-center gap-3 items-center">
              <span style={{ fontSize: 12, color: '#9DB5A4' }}>Popüler:</span>
              {genres.map((g) => (
                <button key={g} onClick={openSearch}
                  style={{ backgroundColor: '#e9e8e5', color: '#2D2D2D', padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24" style={{ backgroundColor: '#faf9f6' }}>
          <div className="max-w-desktop mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            {/* Recommendations */}
            <div>
              <div className="mb-10">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="mb-3" style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, color: '#446651' }}>
                  Sizin için neyin geleceğini bilin
                </h3>
                <p style={{ fontSize: 14, color: '#424843', lineHeight: 1.7 }}>
                  Kişiselleştirilmiş önerilerimiz, binlerce kitap arasından tam da sizin zevkinize hitap edenleri bulmanıza yardımcı olur.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-2 rounded" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
                  <div className="rounded-sm mb-3 flex items-center justify-center" style={{ aspectRatio: '2 / 3', backgroundColor: '#EEF2EC', fontSize: 36 }}>
                    📗
                  </div>
                  <h4 style={{ fontFamily: 'serif', fontWeight: 700, color: '#446651', fontSize: 14 }}>Yüzyıllık Yalnızlık</h4>
                  <p style={{ fontSize: 12, color: '#9DB5A4' }}>Gabriel García Márquez</p>
                </div>
                <div className="p-2 rounded mt-8" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
                  <div className="rounded-sm mb-3 flex items-center justify-center" style={{ aspectRatio: '2 / 3', backgroundColor: '#EEF2EC', fontSize: 36 }}>
                    📘
                  </div>
                  <h4 style={{ fontFamily: 'serif', fontWeight: 700, color: '#446651', fontSize: 14 }}>Siddhartha</h4>
                  <p style={{ fontSize: 12, color: '#9DB5A4' }}>Hermann Hesse</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <div className="mb-10">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="mb-3" style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, color: '#446651' }}>
                  Arkadaşlarınızın ne okuduğunu görün
                </h3>
                <p style={{ fontSize: 14, color: '#424843', lineHeight: 1.7 }}>
                  Kitap okumak paylaştıkça güzelleşir. Arkadaşlarınızı takip edin, yorumlarını okuyun ve topluluğun favorilerini keşfedin.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 p-5 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ width: 48, height: 48, backgroundColor: '#446651' }}>
                    A
                  </div>
                  <div>
                    <p style={{ fontSize: 14, color: '#2D2D2D' }}>
                      <strong>Aslı Yıldız</strong> &quot;Suç ve Ceza&quot;yı bitirdi.
                    </p>
                    <p style={{ color: '#446651', margin: '6px 0', fontSize: 14 }}>⭐⭐⭐⭐✨</p>
                    <p style={{ fontSize: 12, color: '#9DB5A4', fontStyle: 'italic', lineHeight: 1.6 }}>
                      &quot;Raskolnikov&apos;un iç dünyası o kadar etkileyici ki, kitabı elimden bırakamadım. Kesinlikle okunmalı.&quot;
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #e8e8e5' }}>
                  <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ width: 48, height: 48, backgroundColor: '#f2dcca', color: '#6c5b4d' }}>
                    K
                  </div>
                  <div>
                    <p style={{ fontSize: 14, color: '#2D2D2D' }}>
                      <strong>Kerem Can</strong> bir okuma listesi oluşturdu: &quot;Distopya Sevenler&quot;
                    </p>
                    <p style={{ fontSize: 12, color: '#9DB5A4', marginTop: 6 }}>12 kitap • 45 takipçi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lists & Clubs */}
        <section className="py-16 md:py-24" style={{ backgroundColor: 'white', borderTop: '1px solid #e8e8e5', borderBottom: '1px solid #e8e8e5' }}>
          <div className="max-w-desktop mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="md:pr-8">
              <h3 className="mb-6 pb-4" style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, color: '#446651', borderBottom: '1px solid #e8e8e5' }}>
                Listeler
              </h3>
              <div className="flex flex-col">
                {['2024\'ün En İyi Polisiye Kitapları', 'Kışın Battaniye Altında Okunacak Klasikler', 'Bilim Kurgu Tutkunları İçin 10 Temel Eser'].map((title) => (
                  <Link key={title} href="/lists" className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #f4f4f0' }}>
                    <div className="flex items-center gap-3">
                      <span>📋</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#2D2D2D' }}>{title}</span>
                    </div>
                    <span style={{ color: '#c1c8c1' }}>›</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="md:pl-8 md:border-l pt-8 md:pt-0" style={{ borderColor: '#e8e8e5' }}>
              <h3 className="mb-6 pb-4" style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, color: '#446651', borderBottom: '1px solid #e8e8e5' }}>
                Kitap kulüpleri
              </h3>
              <div className="flex flex-col gap-6">
                <Link href="/clubs" className="flex items-center gap-5">
                  <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 64, height: 64, backgroundColor: '#446651', fontSize: 28 }}>
                    📚
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'serif', fontWeight: 700, color: '#446651', fontSize: 15 }}>Modern Edebiyat Atölyesi</h4>
                    <p style={{ fontSize: 12, color: '#9DB5A4' }}>2.450 üye • 12 aktif tartışma</p>
                  </div>
                </Link>
                <Link href="/clubs" className="flex items-center gap-5">
                  <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 64, height: 64, backgroundColor: '#f2dcca', fontSize: 28 }}>
                    📜
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'serif', fontWeight: 700, color: '#446651', fontSize: 15 }}>Tarihsel Roman Severler</h4>
                    <p style={{ fontSize: 12, color: '#9DB5A4' }}>1.120 üye • 5 yeni etkinlik</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'white', borderTop: '1px solid #e8e8e5' }}>
        <div className="max-w-desktop mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <span style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: '#446651' }}>📚 Readora</span>
            <p className="mt-4 max-w-xs" style={{ fontSize: 12, color: '#9DB5A4', lineHeight: 1.6 }}>
              Dünyanın en büyük okur topluluğuna katılın ve kitapların büyülü dünyasını keşfedin.
            </p>
          </div>
          <div>
            <h5 className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#446651' }}>Şirket</h5>
            <ul className="flex flex-col gap-3">
              <li><span style={footerLinkStyle}>Hakkımızda</span></li>
              <li><span style={footerLinkStyle}>Kariyer</span></li>
              <li><span style={footerLinkStyle}>Bize Ulaşın</span></li>
              <li><span style={footerLinkStyle}>Blog</span></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#446651' }}>Destek</h5>
            <ul className="flex flex-col gap-3">
              <li><span style={footerLinkStyle}>Yardım Merkezi</span></li>
              <li><span style={footerLinkStyle}>Kullanım Şartları</span></li>
              <li><span style={footerLinkStyle}>Gizlilik Politikası</span></li>
              <li><span style={footerLinkStyle}>Çerez Ayarları</span></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#446651' }}>Bizi Takip Edin</h5>
            <div className="flex gap-3">
              <span className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: '#e9e8e5', fontSize: 14 }}>🔗</span>
              <span className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: '#e9e8e5', fontSize: 14 }}>🌐</span>
            </div>
            <div className="mt-6">
              <h5 className="mb-3" style={{ fontSize: 13, fontWeight: 700, color: '#446651' }}>Haber Bülteni</h5>
              <div className="flex items-center" style={{ borderBottom: '1px solid #c1c8c1' }}>
                <input type="email" placeholder="E-posta" className="bg-transparent flex-1 focus:outline-none py-2" style={{ fontSize: 13 }} />
                <button style={{ color: '#446651', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>➤</button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-desktop mx-auto px-4 md:px-8 py-4 text-center" style={{ borderTop: '1px solid #f4f4f0', fontSize: 12, color: '#9DB5A4' }}>
          © {new Date().getFullYear()} Readora. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  )
}
