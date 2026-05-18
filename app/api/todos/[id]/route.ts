import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const todo = await prisma.todo.findUnique({ where: { id: Number(id) } })
    if (!todo || todo.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: '찾을 수 없습니다.' }, { status: 404 })
    }

    const data = await req.json()
    const updated = await prisma.todo.update({
      where: { id: Number(id) },
      data: {
        ...(typeof data.content === 'string' && data.content.trim() && { content: data.content.trim() }),
        ...(typeof data.done === 'boolean' && { done: data.done }),
      },
      include: { user: { select: { id: true, email: true } } },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const todo = await prisma.todo.findUnique({ where: { id: Number(id) } })
    if (!todo || todo.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: '찾을 수 없습니다.' }, { status: 404 })
    }

    await prisma.todo.delete({ where: { id: Number(id) } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
