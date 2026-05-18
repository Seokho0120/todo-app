'use client'
import { useTodos } from '@/hooks/use-todos'
import { TodoCard } from './todo-card'

export function TodoList() {
  const { data: todos, isLoading, error } = useTodos()

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-8">불러오는 중...</p>
  }
  if (error) {
    return <p className="text-center text-red-500 py-8">불러오기 실패</p>
  }
  if (!todos?.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        아직 글이 없습니다. 첫 번째로 작성해보세요!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
