'use client'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { TodoForm } from './todo-form'
import { TodoList } from './todo-list'

export function TodoPage() {
  async function handleSignOut() {
    await signOut({ redirect: false })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">할일 피드</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
        >
          로그아웃
        </Button>
      </header>
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <TodoForm />
        <TodoList />
      </main>
    </div>
  )
}
