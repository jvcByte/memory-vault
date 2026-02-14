'use client'

import { useState } from 'react'
import { Memory, Reason, Event, Settings } from '@/types/database'
import MemoryManager from './MemoryManager'
import ReasonManager from './ReasonManager'
import EventManager from './EventManager'
import SettingsManager from './SettingsManager'

interface AdminDashboardProps {
  memoriesCount: number
  memories: Memory[]
  reasons: Reason[]
  events: Event[]
  settings: Settings[]
}

export default function AdminDashboard({
  memoriesCount,
  memories: initialMemories,
  reasons: initialReasons,
  events: initialEvents,
  settings: initialSettings
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'memories' | 'reasons' | 'events' | 'settings'>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'memories', label: 'Memories' },
    { id: 'reasons', label: 'Reasons' },
    { id: 'events', label: 'Events' },
    { id: 'settings', label: 'Settings' }
  ] as const

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading">Admin Dashboard</h1>
          <a href="/" className="px-4 py-2 glass rounded-lg hover:glow transition">
            ← Back to Site
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-gray-400 mb-2">Total Memories</h3>
              <p className="text-4xl font-bold text-primary">{memoriesCount}</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-gray-400 mb-2">Active Reasons</h3>
              <p className="text-4xl font-bold text-primary">
                {initialReasons.filter(r => r.isActive).length}
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-gray-400 mb-2">Upcoming Events</h3>
              <p className="text-4xl font-bold text-primary">{initialEvents.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'memories' && <MemoryManager memories={initialMemories} />}
        {activeTab === 'reasons' && <ReasonManager reasons={initialReasons} />}
        {activeTab === 'events' && <EventManager events={initialEvents} />}
        {activeTab === 'settings' && <SettingsManager settings={initialSettings} />}
      </div>
    </div>
  )
}
