'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface Comment {
  id: number
  content: string
  todoId: number
  userId: number
  author: { id: number; email: string }
  createdAt: string
}

export function useComments(todoId: number) {
  return useQuery<Comment[]>({
    queryKey: ['comments', todoId],
    queryFn: () =>
      axios.get<Comment[]>(`/api/todos/${todoId}/comments`).then((r) => r.data),
  })
}

export function useCreateComment(todoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      axios
        .post<Comment>(`/api/todos/${todoId}/comments`, { content })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', todoId] }),
  })
}

export function useUpdateComment(todoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      axios
        .patch<Comment>(`/api/todos/${todoId}/comments/${commentId}`, { content })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', todoId] }),
  })
}

export function useDeleteComment(todoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: number) =>
      axios.delete(`/api/todos/${todoId}/comments/${commentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', todoId] }),
  })
}
