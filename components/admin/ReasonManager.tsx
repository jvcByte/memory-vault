'use client'

import { useState } from 'react'
import { Reason } from '@/types/database'
import { useRouter } from 'next/navigation'

interface ReasonManagerProps {
  reasons: Reason[]
}

export default function ReasonManager({ reasons: initialReasons }: ReasonManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/reasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, isActive: true })
    })

    setLoading(false)
    setShowForm(false)
    setContent('')
    router.refresh()
  }

  const toggleActive = async (id: string, currentState: boolean) => {
    await fetch('/api/reasons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !currentState })
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this reason?')) {
      await fetch(`/api/reasons?id=${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading">Reason Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition"
        >
          {showForm ? 'Cancel' : '+ Add Reason'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Reason</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={3}
                placeholder="Your smile lights up my world..."
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary rounded-lg hover:bg-primary/80 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Reason'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {initialReasons.map((reason) => (
          <div key={reason.id} className="glass rounded-xl p-4 flex justify-between items-start">
            <div className="flex-1">
              <p className={reason.isActive ? 'text-white' : 'text-gray-500'}>
                {reason.content}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {reason.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(reason.id, reason.isActive)}
                className={`px-3 py-1 rounded text-sm transition ${
                  reason.isActive
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30'
                    : 'bg-green-500/20 hover:bg-green-500/30'
                }`}
              >
                {reason.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(reason.id)}
                className="px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
