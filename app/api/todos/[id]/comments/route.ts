import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await prisma.comment.findMany({
      where: { todoId: Number(id) },
      include: { author: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { content } = body

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 })
    }

    const todo = await prisma.todo.findUnique({ where: { id: Number(id) } })
    if (!todo) {
      return NextResponse.json({ error: '할일을 찾을 수 없습니다.' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        todoId: Number(id),
        userId: Number(session.user.id),
      },
      include: { author: { select: { id: true, email: true } } },
    })
    return NextResponse.json(comment, { status: 201 })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
