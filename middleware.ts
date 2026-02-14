import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login')
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/'

    // Handle auth pages
    if (isAuthPage) {
      if (token) {
        // If user is already authenticated, redirect to the callback URL or home
        const redirectUrl = new URL(callbackUrl, req.url)
        return NextResponse.redirect(redirectUrl)
      }
      return null
    }

    // Admin route protection
    if (isAdmin && token?.role !== 'owner') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // If no token and not an auth page, redirect to login with the current URL as callback
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  },
  {
    callbacks: {
      // We handle authorization in the middleware function
      authorized: () => true,
    },
  }
)

// Don't run middleware on static files, API routes, or auth routes
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
