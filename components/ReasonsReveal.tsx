'use client'

import { motion } from 'framer-motion'
import { Reason } from '@/types/database'
import { useState } from 'react'

interface ReasonsRevealProps {
  reasons: Reason[]
}

export default function ReasonsReveal({ reasons }: ReasonsRevealProps) {
  const [revealedReasons, setRevealedReasons] = useState<Set<string>>(new Set())

  const handleReveal = (id: string) => {
    setRevealedReasons(prev => new Set(prev).add(id))
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-heading text-center mb-4">Why I Love You</h2>
        <p className="text-center text-gray-400 mb-16">Click each card to reveal</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 min-h-[200px] flex items-center justify-center cursor-pointer hover:glow transition-all"
              onClick={() => handleReveal(reason.id)}
            >
              {revealedReasons.has(reason.id) ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-lg"
                >
                  {reason.content}
                </motion.p>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">❤️</div>
                  <p className="text-gray-400">Click to reveal</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
