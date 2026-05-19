'use client'
import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { useTodos } from '@/hooks/use-todos'
import { TodoCard } from './todo-card'
import { TodoTable } from './todo-table'

type ViewMode = 'card' | 'table'

export function TodoList() {
  const { data: todos, isLoading, error } = useTodos()
  const [view, setView] = useState<ViewMode>('card')

  if (isLoading) {
    return <p className="text-center text-[#b3b3b3] py-8">불러오는 중...</p>
  }
  if (error) {
    return <p className="text-center text-[#f3727f] py-8">불러오기 실패</p>
  }
  if (!todos?.length) {
    return (
      <p className="text-center text-[#b3b3b3] py-8">
        아직 글이 없습니다. 첫 번째로 작성해보세요!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView('card')}
          className={`flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-bold uppercase tracking-[1.4px] transition-all ${
            view === 'card'
              ? 'bg-[#1ed760] text-black'
              : 'bg-[#1f1f1f] text-[#b3b3b3] border border-[#4d4d4d] hover:border-white hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          카드
        </button>
        <button
          onClick={() => setView('table')}
          className={`flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-bold uppercase tracking-[1.4px] transition-all ${
            view === 'table'
              ? 'bg-[#1ed760] text-black'
              : 'bg-[#1f1f1f] text-[#b3b3b3] border border-[#4d4d4d] hover:border-white hover:text-white'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          테이블
        </button>
      </div>

      {view === 'card' ? (
        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      ) : (
        <TodoTable todos={todos} />
      )}
    </div>
  )
}
