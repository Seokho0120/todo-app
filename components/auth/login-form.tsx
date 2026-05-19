'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('이메일 또는 비밀번호가 틀렸습니다.')
    } else {
      router.push('/todos')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm bg-[#121212] rounded-lg p-8">
      <h2 className="text-[28px] font-bold text-white mb-8 text-center tracking-tight">
        로그인
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-12 px-4 rounded-[4px] bg-[#121212] text-white text-sm placeholder:text-[#b3b3b3] border border-[#878787] outline-none focus:border-white transition-colors"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full h-12 px-4 rounded-[4px] bg-[#121212] text-white text-sm placeholder:text-[#b3b3b3] border border-[#878787] outline-none focus:border-white transition-colors"
        />
        {error && (
          <p className="text-sm text-[#f3727f] pt-1">{error}</p>
        )}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#1ed760] text-black text-sm font-bold uppercase tracking-[2px] hover:bg-[#1fdf64] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </form>
      <div className="mt-6 relative flex items-center gap-4">
        <div className="flex-1 h-px bg-[#4d4d4d]" />
        <span className="text-[#b3b3b3] text-xs font-bold uppercase tracking-widest">또는</span>
        <div className="flex-1 h-px bg-[#4d4d4d]" />
      </div>
      <div className="mt-6 text-center">
        <p className="text-[#b3b3b3] text-sm">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-white font-bold underline hover:text-[#1ed760] transition-colors">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
