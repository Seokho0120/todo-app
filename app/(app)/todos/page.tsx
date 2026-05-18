import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TodoPage } from '@/components/todos/todo-page'

export default async function TodosPage() {
  const session = await auth()
  if (!session) redirect('/login')
  return <TodoPage />
}
