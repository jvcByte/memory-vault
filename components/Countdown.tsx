'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Event } from '@/types/database'

interface CountdownProps {
  event: Event
}

export default function Countdown({ event }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(event.targetDate).getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [event.targetDate])

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-heading mb-4">{event.title}</h2>
        
        <div className="grid grid-cols-4 gap-4 mt-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <motion.div
              key={unit}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="text-5xl font-bold text-primary mb-2">{value}</div>
              <div className="text-gray-400 capitalize">{unit}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
