'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useComments, useCreateComment } from '@/hooks/use-comments'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <div className="border-t pt-2 mt-2">
      <button
        onClick={() => setOpenCommentTodoId(isOpen ? null : todoId)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        댓글 {comments?.length ?? 0}개
        <span className="text-xs ml-1">{isOpen ? '▲ 접기' : '▼ 펼치기'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {isLoading && (
            <p className="text-xs text-muted-foreground">불러오는 중...</p>
          )}
          {!isLoading && comments?.length === 0 && (
            <p className="text-xs text-muted-foreground">첫 번째 댓글을 남겨보세요!</p>
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
              <Input
                placeholder="댓글을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPending}
                className="h-8 text-sm"
              />
              <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
                등록
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
