import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { memories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = await db.insert(memories).values(body).returning()
  return NextResponse.json(result[0])
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, ...data } = body
  const result = await db.update(memories).set({ ...data, updatedAt: new Date() }).where(eq(memories.id, id)).returning()
  return NextResponse.json(result[0])
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  await db.delete(memories).where(eq(memories.id, id))
  return NextResponse.json({ success: true })
}
