import { getCurrentUser } from '@/lib/queries'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { memories, reasons, events, settings } from '@/lib/db/schema'
import { count } from 'drizzle-orm'
import { desc, asc } from 'drizzle-orm'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'owner') {
    redirect('/')
  }

  const [
    memoriesCountResult,
    memoriesData,
    reasonsData,
    eventsData,
    settingsData
  ] = await Promise.all([
    db.select({ count: count() }).from(memories),
    db.select().from(memories).orderBy(desc(memories.createdAt)),
    db.select().from(reasons).orderBy(desc(reasons.createdAt)),
    db.select().from(events).orderBy(asc(events.targetDate)),
    db.select().from(settings)
  ])

  return (
    <AdminDashboard
      memoriesCount={memoriesCountResult[0]?.count || 0}
      memories={memoriesData}
      reasons={reasonsData}
      events={eventsData}
      settings={settingsData}
    />
  )
}
