'use client'
import { useState } from 'react'
import { useUpdateComment, useDeleteComment } from '@/hooks/use-comments'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Check, X, User } from 'lucide-react'
import type { Comment } from '@/hooks/use-comments'

interface Props {
  comment: Comment
  todoId: number
  currentUserId: number | null
}

export function CommentItem({ comment, todoId, currentUserId }: Props) {
  const { editingCommentId, setEditingCommentId } = useUIStore()
  const { mutate: updateComment } = useUpdateComment(todoId)
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(todoId)
  const [editContent, setEditContent] = useState(comment.content)

  const isEditing = editingCommentId === comment.id
  const isOwner = currentUserId === comment.userId

  function handleSave() {
    if (!editContent.trim()) return
    updateComment(
      { commentId: comment.id, content: editContent.trim() },
      { onSuccess: () => setEditingCommentId(null) }
    )
  }

  return (
    <div className="flex items-start gap-2 text-sm">
      <User className="w-3 h-3 mt-1 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-xs text-muted-foreground mr-2">
          {comment.author.email}
        </span>
        {isEditing ? (
          <div className="flex gap-1 mt-1">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="h-6 text-xs flex-1"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                setEditContent(comment.content)
                setEditingCommentId(null)
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <span>{comment.content}</span>
        )}
      </div>
      {isOwner && !isEditing && (
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setEditingCommentId(comment.id)}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => deleteComment(comment.id)}
            disabled={isDeleting}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
