import { create } from 'zustand'

interface UIStore {
  editingTodoId: number | null
  setEditingTodoId: (id: number | null) => void
  editingCommentId: number | null
  setEditingCommentId: (id: number | null) => void
  openCommentTodoId: number | null
  setOpenCommentTodoId: (id: number | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  editingTodoId: null,
  setEditingTodoId: (id) => set({ editingTodoId: id }),
  editingCommentId: null,
  setEditingCommentId: (id) => set({ editingCommentId: id }),
  openCommentTodoId: null,
  setOpenCommentTodoId: (id) => set({ openCommentTodoId: id }),
}))
