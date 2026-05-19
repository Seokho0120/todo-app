'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useComments, useCreateComment } from '@/hooks/use-comments'
import { useUIStore } from '@/store/ui-store'
import { MessageCircle } from 'lucide-react'
import { CommentItem } from './comment-item'

export function CommentSection({ todoId }: { todoId: number }) {
  const { openCommentTodoId, setOpenCommentTodoId } = useUIStore()
  const isOpen = openCommentTodoId === todoId
  const { data: comments, isLoading } = useComments(todoId)
  const { mutate: createComment, isPending } = useCreateComment(todoId)
  const [content, setContent] = useState('')
  const { data: session } = useSession()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    createComment(content, { onSuccess: () => setContent('') })
  }

  return (
    <div className="border-t border-[#4d4d4d] pt-3 mt-1">
      <button
        onClick={() => setOpenCommentTodoId(isOpen ? null : todoId)}
        className="flex items-center gap-1.5 text-sm text-[#b3b3b3] hover:text-white transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>댓글 {comments?.length ?? 0}개</span>
        <span className="text-xs ml-0.5">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {isLoading && (
            <p className="text-xs text-[#b3b3b3]">불러오는 중...</p>
          )}
          {!isLoading && comments?.length === 0 && (
            <p className="text-xs text-[#b3b3b3]">첫 번째 댓글을 남겨보세요!</p>
          )}
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              todoId={todoId}
              currentUserId={session?.user?.id ? Number(session.user.id) : null}
            />
          ))}
          {session && (
            <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
              <input
                placeholder="댓글을 입력하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPending}
                className="flex-1 h-8 px-4 rounded-full bg-[#1f1f1f] text-sm text-white placeholder:text-[#b3b3b3] shadow-[rgb(18,18,18)_0px_1px_0px,rgb(124,124,124)_0px_0px_0px_1px_inset] outline-none focus:shadow-[rgb(18,18,18)_0px_1px_0px,rgb(255,255,255)_0px_0px_0px_1px_inset] transition-all"
              />
              <button
                type="submit"
                disabled={isPending || !content.trim()}
                className="h-8 px-4 rounded-full bg-[#1ed760] text-black text-xs font-bold uppercase tracking-[1.4px] hover:bg-[#1fdf64] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                등록
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
