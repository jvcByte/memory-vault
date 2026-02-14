import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { key, value } = body
  
  const result = await db
    .update(settings)
    .set({ value, updatedAt: new Date() })
    .where(eq(settings.key, key))
    .returning()
    
  return NextResponse.json(result[0])
}
