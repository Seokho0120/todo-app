'use client'
import { useState } from 'react'
import { useCreateTodo } from '@/hooks/use-todos'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="새 할일을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending || !content.trim()}>
        추가
      </Button>
    </form>
  )
}
