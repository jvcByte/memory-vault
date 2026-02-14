import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db'
import { isEmailAllowed } from './config'

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as unknown as NextAuthOptions['adapter'],
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow whitelisted email
      if (!user.email || !isEmailAllowed(user.email)) {
        console.log('❌ Sign in rejected for:', user.email)
        return false
      }
      console.log('✅ Sign in allowed for:', user.email)
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Always set as owner since only one email is allowed
        session.user.role = 'owner'
      }
      return session
    },
  },
  session: {
    strategy: 'database',
  },
  events: {
    async createUser({ user }) {
      // Automatically set the allowed email as owner
      if (user.email && isEmailAllowed(user.email)) {
        console.log('🎯 Creating user and setting as owner:', user.email)
        const { users } = await import('./db/schema')
        const { eq } = await import('drizzle-orm')
        await db.update(users).set({ role: 'owner' }).where(eq(users.id, user.id))
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
