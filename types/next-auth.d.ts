import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'owner' | 'viewer'
    } & DefaultSession['user']
  }

  interface User {
    role: 'owner' | 'viewer'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'owner' | 'viewer'
  }
}
