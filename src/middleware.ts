import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token (if user is authenticated)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if user is trying to access dashboard or other protected routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Redirect to login if not authenticated
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', encodeURI(pathname))
      return NextResponse.redirect(url)
    }

    // For role-specific dashboards, check if user has the right role
    if (
      pathname.startsWith('/dashboard/supplier') &&
      token.role !== 'SUPPLIER' &&
      token.role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (
      pathname.startsWith('/dashboard/buyer') &&
      token.role !== 'BUYER' &&
      token.role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (
      pathname.startsWith('/dashboard/financier') &&
      token.role !== 'FINANCIER' &&
      token.role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/dashboard/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect to dashboard if trying to access auth pages while logged in
  if (pathname.startsWith('/auth') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Continue for all other routes
  return NextResponse.next()
}

// Only run middleware on the following paths
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
