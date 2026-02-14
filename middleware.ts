import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login')
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')

    // Allow access to auth pages if not authenticated
    if (isAuthPage) {
      if (token) {
        // If user is already authenticated, redirect to home
        return NextResponse.redirect(new URL('/', req.url))
      }
      return null
    }

    // Admin route protection
    if (isAdmin && token?.role !== 'owner') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // If no token and not an auth page, redirect to login
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`, req.url)
      )
    }
  },
  {
    callbacks: {
      // We don't need to check the token here as we handle it in the middleware function
      // This is just a placeholder to satisfy the type definition
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
