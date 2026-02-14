import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function TestAuthPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-heading mb-4">Auth Test</h1>
        
        {session ? (
          <div>
            <p className="text-green-400 mb-4">✅ Authenticated!</p>
            <pre className="bg-black/50 p-4 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <p className="text-red-400 mb-4">❌ Not authenticated</p>
            <a href="/login" className="text-primary hover:underline">
              Go to login
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
