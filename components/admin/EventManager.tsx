'use client'

import { useState } from 'react'
import { Event } from '@/types/database'
import { useRouter } from 'next/navigation'

interface EventManagerProps {
  events: Event[]
}

export default function EventManager({ events: initialEvents }: EventManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    target_date: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        targetDate: new Date(formData.target_date)
      })
    })

    setLoading(false)
    setShowForm(false)
    setFormData({ title: '', target_date: '' })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this event?')) {
      await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading">Event Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition"
        >
          {showForm ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Our Anniversary"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Target Date & Time</label>
              <input
                type="datetime-local"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary rounded-lg hover:bg-primary/80 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Create Event'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {initialEvents.map((event) => (
          <div key={event.id} className="glass rounded-xl p-4 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-heading mb-1">{event.title}</h3>
              <p className="text-sm text-gray-400">
                {new Date(event.targetDate).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(event.id)}
              className="px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30 transition text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
