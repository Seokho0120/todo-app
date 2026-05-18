import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { commentId } = await params
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    })
    if (!comment || comment.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { content } = await req.json()
    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 })
    }

    const updated = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { content: content.trim() },
      include: { author: { select: { id: true, email: true } } },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { commentId } = await params
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    })
    if (!comment || comment.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    await prisma.comment.delete({ where: { id: Number(commentId) } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
