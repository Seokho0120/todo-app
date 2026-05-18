'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface Todo {
  id: number
  content: string
  done: boolean
  userId: number
  user: { id: number; email: string }
  createdAt: string
}

export function useTodos() {
  return useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: () => axios.get<Todo[]>('/api/todos').then((r) => r.data),
  })
}

export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      axios.post<Todo>('/api/todos', { content }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useUpdateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<Pick<Todo, 'content' | 'done'>>
    }) => axios.patch<Todo>(`/api/todos/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => axios.delete(`/api/todos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}
