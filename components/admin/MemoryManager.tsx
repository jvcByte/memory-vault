'use client'

import { useState } from 'react'
import { Memory } from '@/types/database'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface MemoryManagerProps {
  memories: Memory[]
}

export default function MemoryManager({ memories: initialMemories }: MemoryManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    memory_date: '',
    tags: '',
    is_featured: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      title: formData.title,
      description: formData.description,
      memoryDate: formData.memory_date,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      isFeatured: formData.is_featured
    }

    if (editingId) {
      await fetch('/api/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...data })
      })
    } else {
      await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }

    setLoading(false)
    setShowForm(false)
    setEditingId(null)
    setFormData({ title: '', description: '', memory_date: '', tags: '', is_featured: false })
    router.refresh()
  }

  const handleEdit = (memory: Memory) => {
    setFormData({
      title: memory.title,
      description: memory.description || '',
      memory_date: memory.memoryDate,
      tags: memory.tags.join(', '),
      is_featured: memory.isFeatured
    })
    setEditingId(memory.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this memory?')) {
      await fetch(`/api/memories?id=${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading">Memory Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition"
        >
          {showForm ? 'Cancel' : '+ Add Memory'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Date</label>
              <input
                type="date"
                value={formData.memory_date}
                onChange={(e) => setFormData({ ...formData, memory_date: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="love, adventure, special"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm">Featured Memory</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary rounded-lg hover:bg-primary/80 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update Memory' : 'Create Memory'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {initialMemories.map((memory) => (
          <div key={memory.id} className="glass rounded-xl p-4 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-heading mb-1">{memory.title}</h3>
              <p className="text-sm text-gray-400 mb-2">
                {new Date(memory.memoryDate).toLocaleDateString()}
              </p>
              <p className="text-gray-300">{memory.description}</p>
              {memory.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {memory.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(memory)}
                className="px-3 py-1 bg-blue-500/20 rounded hover:bg-blue-500/30 transition text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(memory.id)}
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
