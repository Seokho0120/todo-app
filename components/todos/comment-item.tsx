'use client'
import { useState } from 'react'
import { useUpdateComment, useDeleteComment } from '@/hooks/use-comments'
import { useUIStore } from '@/store/ui-store'
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
      <User className="w-3 h-3 mt-1 text-[#b3b3b3] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-bold text-xs text-[#b3b3b3] mr-2">
          {comment.author.email}
        </span>
        {isEditing ? (
          <div className="flex gap-1 mt-1">
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="h-7 px-3 rounded-full bg-[#1f1f1f] text-xs text-white flex-1 shadow-[rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset] outline-none focus:shadow-[rgb(18,18,18)_0px_1px_0px,rgb(255,255,255)_0px_0px_0px_1px_inset]"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#1ed760] hover:bg-[#1f1f1f] transition-colors"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setEditContent(comment.content)
                setEditingCommentId(null)
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#b3b3b3] hover:bg-[#1f1f1f] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <span className="text-white">{comment.content}</span>
        )}
      </div>
      {isOwner && !isEditing && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => setEditingCommentId(comment.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => deleteComment(comment.id)}
            disabled={isDeleting}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-[#f3727f] hover:bg-[#1f1f1f] transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
