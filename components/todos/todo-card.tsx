'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useUpdateTodo, useDeleteTodo } from '@/hooks/use-todos'
import { useUIStore } from '@/store/ui-store'
import { Checkbox } from '@/components/ui/checkbox'
import { Pencil, Trash2, Check, X, User } from 'lucide-react'
import { CommentSection } from './comment-section'
import type { Todo } from '@/hooks/use-todos'

export function TodoCard({ todo }: { todo: Todo }) {
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
    <div className={`bg-[#181818] rounded-lg overflow-hidden transition-colors hover:bg-[#282828] ${isOwner ? 'border-l-4 border-l-[#1ed760]' : ''}`}>
      <div className="p-4 flex items-start gap-3">
        <Checkbox
          checked={todo.done}
          onCheckedChange={handleToggle}
          disabled={!isOwner}
          className="mt-0.5 flex-shrink-0 border-[#4d4d4d] data-[state=checked]:bg-[#1ed760] data-[state=checked]:border-[#1ed760]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <User className="w-3 h-3 text-[#b3b3b3]" />
            <span className="text-xs text-[#b3b3b3] font-medium">
              {todo.user.email}
            </span>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 h-8 px-3 rounded-full bg-[#1f1f1f] text-sm text-white shadow-[rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset] outline-none focus:shadow-[rgb(18,18,18)_0px_1px_0px,rgb(255,255,255)_0px_0px_0px_1px_inset]"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#1ed760] hover:bg-[#1f1f1f] transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditContent(todo.content)
                  setEditingTodoId(null)
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:bg-[#1f1f1f] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span
              className={`text-sm ${
                todo.done ? 'line-through text-[#b3b3b3]' : 'text-white'
              }`}
            >
              {todo.content}
            </span>
          )}
        </div>
        {isOwner && !isEditing && (
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setEditingTodoId(todo.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              disabled={isDeleting}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-[#f3727f] hover:bg-[#1f1f1f] transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="px-4 pb-4 pt-0">
        <CommentSection todoId={todo.id} />
      </div>
    </div>
  )
}
