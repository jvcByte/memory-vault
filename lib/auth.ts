// lib/auth.ts
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
        host: process.env.EMAIL_SERVER_HOST || '',
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER || '',
          pass: process.env.EMAIL_SERVER_PASSWORD || '',
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  theme: {
    colorScheme: 'auto',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      console.log('🔑 Sign in attempt for:', user?.email);
      // Only allow whitelisted email
      if (!user?.email || !isEmailAllowed(user.email)) {
        console.log('❌ Sign in rejected for:', user?.email);
        return false;
      }
      console.log('✅ Sign in allowed for:', user.email);
      return true;
    },
    async jwt({ token, user }) {
      console.log('🔐 JWT Callback:', { token, user });
      if (user) {
        token.id = user.id;
        token.role = user.role === 'viewer' ? 'viewer' : 'owner';
      }
      return token;
    },
    async session({ session, token }) {
      console.log('📝 Session Callback:', { session, token });
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'owner' | 'viewer';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirecting:', { url, baseUrl });
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};