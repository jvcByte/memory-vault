'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { ALLOWED_EMAIL } from '@/lib/config'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Check if email is allowed
    if (email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      setMessage('This email is not authorized to access this application.')
      setLoading(false)
      return
    }

    const result = await signIn('email', {
      email,
      redirect: false,
      callbackUrl: '/',
    })

    if (result?.error) {
      setMessage('Error sending email. Please try again.')
    } else {
      setMessage('Check your email for the magic link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-heading text-center mb-2">MemoryVault</h1>
        <p className="text-center text-gray-400 mb-8">Private Access Only</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none transition"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary hover:bg-primary/80 transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('Check') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          This is a private application. Only authorized users can access.
        </p>
      </div>
    </div>
  )
}
