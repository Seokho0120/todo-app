'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useUpdateTodo, useDeleteTodo } from '@/hooks/use-todos'
import { useUIStore } from '@/store/ui-store'
import { Checkbox } from '@/components/ui/checkbox'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { Todo } from '@/hooks/use-todos'

export function TodoTable({ todos }: { todos: Todo[] }) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#4d4d4d]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#282828] border-b border-[#4d4d4d]">
            <th className="w-10 px-4 py-3 text-left" />
            <th className="px-4 py-3 text-left text-xs font-bold text-[#b3b3b3] uppercase tracking-[1.4px]">할일</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[#b3b3b3] uppercase tracking-[1.4px] hidden sm:table-cell">작성자</th>
            <th className="w-20 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {todos.map((todo, i) => (
            <TodoRow key={todo.id} todo={todo} isLast={i === todos.length - 1} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TodoRow({ todo, isLast }: { todo: Todo; isLast: boolean }) {
  const { data: session } = useSession()
  const { editingTodoId, setEditingTodoId } = useUIStore()
  const { mutate: updateTodo } = useUpdateTodo()
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo()
  const [editContent, setEditContent] = useState(todo.content)

  const isEditing = editingTodoId === todo.id
  const isOwner = session?.user?.id === String(todo.userId)

  function handleToggle() {
    if (!isOwner) return
    updateTodo({ id: todo.id, data: { done: !todo.done } })
  }

  function handleSave() {
    if (!editContent.trim()) return
    updateTodo(
      { id: todo.id, data: { content: editContent.trim() } },
      { onSuccess: () => setEditingTodoId(null) }
    )
  }

  return (
    <tr
      className={`bg-[#181818] hover:bg-[#282828] transition-colors group ${!isLast ? 'border-b border-[#4d4d4d]' : ''} ${isOwner ? 'border-l-2 border-l-[#1ed760]' : ''}`}
    >
      <td className="px-4 py-3">
        <Checkbox
          checked={todo.done}
          onCheckedChange={handleToggle}
          disabled={!isOwner}
          className="border-[#4d4d4d] data-[state=checked]:bg-[#1ed760] data-[state=checked]:border-[#1ed760]"
        />
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <div className="flex gap-2 items-center">
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 h-8 px-3 rounded-full bg-[#1f1f1f] text-sm text-white shadow-[rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset] outline-none focus:shadow-[rgb(18,18,18)_0px_1px_0px,rgb(255,255,255)_0px_0px_0px_1px_inset]"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button onClick={handleSave} className="w-7 h-7 rounded-full flex items-center justify-center text-[#1ed760] hover:bg-[#1f1f1f] transition-colors">
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => { setEditContent(todo.content); setEditingTodoId(null) }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#b3b3b3] hover:bg-[#1f1f1f] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <span className={todo.done ? 'line-through text-[#b3b3b3]' : 'text-white'}>
            {todo.content}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-[#b3b3b3] text-xs hidden sm:table-cell">
        {todo.user.email}
      </td>
      <td className="px-4 py-3">
        {isOwner && !isEditing && (
          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingTodoId(todo.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              disabled={isDeleting}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-[#f3727f] hover:bg-[#1f1f1f] transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
