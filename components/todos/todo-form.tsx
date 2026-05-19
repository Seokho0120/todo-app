'use client'
import { useState } from 'react'
import { useCreateTodo } from '@/hooks/use-todos'

export function TodoForm() {
  const [content, setContent] = useState('')
  const { mutate: createTodo, isPending } = useCreateTodo()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    createTodo(content, {
      onSuccess: () => setContent(''),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        placeholder="새 할일을 추가하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        className="flex-1 h-12 px-5 rounded-full bg-[#1f1f1f] text-white text-sm placeholder:text-[#b3b3b3] shadow-[rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset] outline-none focus:shadow-[rgb(18,18,18)_0px_1px_0px,rgb(255,255,255)_0px_0px_0px_1px_inset] transition-all"
      />
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="h-12 px-6 rounded-full bg-[#1ed760] text-black text-sm font-bold uppercase tracking-[1.4px] hover:bg-[#1fdf64] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
      >
        추가
      </button>
    </form>
  )
}
