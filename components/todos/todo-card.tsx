'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useUpdateTodo, useDeleteTodo } from '@/hooks/use-todos'
import { useUIStore } from '@/store/ui-store'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
    <Card className={isOwner ? 'border-l-4 border-l-primary' : ''}>
      <CardContent className="flex items-start gap-2">
        <Checkbox
          checked={todo.done}
          onCheckedChange={handleToggle}
          disabled={!isOwner}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              {todo.user.email}
            </span>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 h-7"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSave}>
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditContent(todo.content)
                  setEditingTodoId(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <span
              className={`text-sm ${
                todo.done ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {todo.content}
            </span>
          )}
        </div>
        {isOwner && !isEditing && (
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditingTodoId(todo.id)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteTodo(todo.id)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
      <CardContent className="pt-0">
        <CommentSection todoId={todo.id} />
      </CardContent>
    </Card>
  )
}
