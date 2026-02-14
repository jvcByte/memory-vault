import { Suspense } from 'react'
import { getCurrentUser, getMemories, getActiveReasons, getEvents, getProposalUnlocked } from '@/lib/queries'
import Hero from '@/components/Hero'
import Timeline from '@/components/Timeline'
import ReasonsReveal from '@/components/ReasonsReveal'
import Countdown from '@/components/Countdown'
import Proposal from '@/components/Proposal'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const [memories, reasons, events, proposalUnlocked] = await Promise.all([
    getMemories(),
    getActiveReasons(),
    getEvents(),
    getProposalUnlocked()
  ])

  const isOwner = user.role === 'owner'
  const nextEvent = events[0]

  return (
    <main>
      <Hero user={user} />
      
      {memories.length > 0 && (
        <Timeline memories={memories} isOwner={isOwner} />
      )}
      
      {reasons.length > 0 && (
        <ReasonsReveal reasons={reasons} />
      )}
      
      {nextEvent && (
        <Countdown event={nextEvent} />
      )}
      
      {proposalUnlocked && (
        <Proposal />
      )}

      {isOwner && (
        <div className="fixed bottom-8 right-8 z-50">
          <a
            href="/admin"
            className="px-6 py-3 bg-primary rounded-full hover:bg-primary/80 transition glow"
          >
            Admin Panel
          </a>
        </div>
      )}
    </main>
  )
}
