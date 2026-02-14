'use client'

import { motion } from 'framer-motion'
import { User } from '@/types/database'

interface HeroProps {
  user: User
}

export default function Hero({ user }: HeroProps) {
  // Extract first name from email
  const firstName = user.name || user.email.split('@')[0]
  
  return (
    <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle glow effects */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-4"
        >
          <p className="text-xl text-gray-400">Welcome back,</p>
          <h2 className="text-4xl font-heading text-primary capitalize">{firstName}</h2>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-6xl md:text-8xl font-heading mb-6"
        >
          Our Story
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
        >
          Every moment with you is a memory worth keeping.
          <br />
          This is our vault of love, laughter, and forever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-6xl"
        >
          ❤️
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12"
        >
          <p className="text-gray-400">Scroll to explore our journey</p>
          <div className="mt-4 animate-bounce">↓</div>
        </motion.div>
      </div>
    </section>
  )
}
