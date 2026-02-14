import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db'
import { isEmailAllowed, ALLOWED_EMAIL } from './config'

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as any,
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
    verifyRequest: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow whitelisted email
      if (!user.email || !isEmailAllowed(user.email)) {
        return false
      }
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
        const { users } = await import('./db/schema')
        const { eq } = await import('drizzle-orm')
        await db.update(users).set({ role: 'owner' }).where(eq(users.id, user.id))
      }
    },
  },
}
