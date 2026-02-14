'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import confetti from 'canvas-confetti'

export default function Proposal() {
  const [step, setStep] = useState(0)
  const [answered, setAnswered] = useState(false)

  const handleYes = async () => {
    setAnswered(true)
    
    // Confetti celebration
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff4d6d', '#ff8fab', '#ffffff']
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff4d6d', '#ff8fab', '#ffffff']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()

    // Save response
    await fetch('/api/proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: 'yes' })
    })
  }

  const handleNoHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const maxX = window.innerWidth - button.offsetWidth - 20
    const maxY = window.innerHeight - button.offsetHeight - 20
    
    const randomX = Math.random() * maxX
    const randomY = Math.random() * maxY
    
    button.style.position = 'fixed'
    button.style.left = `${randomX}px`
    button.style.top = `${randomY}px`
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="relative z-10 text-center max-w-4xl">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed">
              Every memory we've shared, every laugh, every moment...
              <br />
              has led me to this question.
            </p>
            <button
              onClick={() => setStep(1)}
              className="px-8 py-4 bg-primary rounded-full text-xl hover:bg-primary/80 transition glow"
            >
              Open the question
            </button>
          </motion.div>
        )}

        {step === 1 && !answered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-8xl font-heading mb-12">
              Will you be my Valentine?
            </h2>
            
            <div className="flex gap-6 justify-center items-center">
              <button
                onClick={handleYes}
                className="px-12 py-6 bg-primary rounded-full text-2xl hover:bg-primary/80 transition glow"
              >
                YES! ❤️
              </button>
              
              <button
                onMouseEnter={handleNoHover}
                className="px-12 py-6 bg-gray-700 rounded-full text-2xl hover:bg-gray-600 transition"
              >
                No
              </button>
            </div>
          </motion.div>
        )}

        {answered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-8xl font-heading mb-8">
              You said YES! 🎉
            </h2>
            <p className="text-3xl text-gray-300">
              You've made me the happiest person alive ❤️
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
