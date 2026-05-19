'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '회원가입에 실패했습니다.')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="w-full max-w-sm bg-[#121212] rounded-lg p-8">
      <h2 className="text-[28px] font-bold text-white mb-2 text-center tracking-tight">
        무료로 시작하기
      </h2>
      <p className="text-[#b3b3b3] text-sm text-center mb-8">
        계정을 만들어 시작하세요
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-white mb-1 uppercase tracking-[0.1em]">
            이메일 주소
          </label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-[4px] bg-[#121212] text-white text-sm placeholder:text-[#b3b3b3] border border-[#878787] outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-white mb-1 uppercase tracking-[0.1em]">
            비밀번호
          </label>
          <input
            type="password"
            placeholder="6자 이상 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="w-full h-12 px-4 rounded-[4px] bg-[#121212] text-white text-sm placeholder:text-[#b3b3b3] border border-[#878787] outline-none focus:border-white transition-colors"
          />
        </div>
        {error && (
          <p className="text-sm text-[#f3727f] pt-1">{error}</p>
        )}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#1ed760] text-black text-sm font-bold uppercase tracking-[2px] hover:bg-[#1fdf64] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '계정 만들기'}
          </button>
        </div>
      </form>
      <div className="mt-8 border-t border-[#4d4d4d] pt-6 text-center">
        <p className="text-[#b3b3b3] text-sm">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-white font-bold underline hover:text-[#1ed760] transition-colors">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
