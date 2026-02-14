import { db } from './db'
import { memories, reasons, events, settings, users } from './db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getMemories() {
  return await db.select().from(memories).orderBy(desc(memories.memoryDate))
}

export async function getMemory(id: string) {
  const result = await db.select().from(memories).where(eq(memories.id, id)).limit(1)
  return result[0]
}

export async function getActiveReasons() {
  return await db.select().from(reasons).where(eq(reasons.isActive, true))
}

export async function getEvents() {
  return await db.select().from(events).orderBy(asc(events.targetDate))
}

export async function getSetting(key: string) {
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
  return result[0]?.value
}

export async function getProposalUnlocked() {
  const value = await getSetting('proposal_unlocked')
  return value === true
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const result = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
  return result[0]
}

export async function isOwner() {
  const user = await getCurrentUser()
  return user?.role === 'owner'
}
