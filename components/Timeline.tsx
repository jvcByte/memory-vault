'use client'

import { motion } from 'framer-motion'
import { Memory } from '@/types/database'
import Image from 'next/image'
import { useState } from 'react'

interface TimelineProps {
  memories: Memory[]
  isOwner: boolean
}

export default function Timeline({ memories, isOwner }: TimelineProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-heading text-center mb-16">Our Timeline</h2>
        
        <div className="space-y-12">
          {memories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col md:flex-row gap-8 items-center ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div className="flex-1">
                <div className="glass rounded-2xl p-6 hover:glow transition-all cursor-pointer"
                     onClick={() => setSelectedMemory(memory)}>
                  <div className="text-sm text-accent mb-2">
                    {new Date(memory.memoryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <h3 className="text-2xl font-heading mb-3">{memory.title}</h3>
                  <p className="text-gray-300">{memory.description}</p>
                  {memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {memory.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {memory.imageUrl && (
                <div className="flex-1">
                  <div className="relative aspect-video rounded-2xl overflow-hidden glass">
                    <Image
                      src={memory.imageUrl}
                      alt={memory.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMemory(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMemory.imageUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                <Image
                  src={selectedMemory.imageUrl}
                  alt={selectedMemory.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h3 className="text-3xl font-heading mb-2">{selectedMemory.title}</h3>
            <p className="text-accent mb-4">
              {new Date(selectedMemory.memoryDate).toLocaleDateString()}
            </p>
            <p className="text-gray-300 mb-4">{selectedMemory.description}</p>
            {selectedMemory.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMemory.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => setSelectedMemory(null)}
              className="mt-6 px-6 py-2 bg-primary rounded-lg hover:bg-primary/80 transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </section>
  )
}
