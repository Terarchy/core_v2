import { NextResponse } from 'next/server'
import { middleware } from '@/middleware'
import { getToken } from 'next-auth/jwt'

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}))

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => 'next-response'),
    redirect: jest.fn((url) => ({ redirectUrl: url })),
  },
}))

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow access to public routes', async () => {
    // Arrange
    const request = {
      nextUrl: {
        pathname: '/about',
      },
      url: 'http://localhost:3000/about',
    }

    // Act
    const response = await middleware(request as any)

    // Assert
    expect(NextResponse.next).toHaveBeenCalled()
    expect(response).toBe('next-response')
  })

  it('should redirect to login for protected routes without token', async () => {
    // Arrange
    const request = {
      nextUrl: {
        pathname: '/dashboard',
        searchParams: new URLSearchParams(),
      },
      url: 'http://localhost:3000/dashboard',
    }

    // Mock the getToken function to return null (no token)
    ;(getToken as jest.Mock).mockResolvedValue(null)

    // Act
    const response = await middleware(request as any)

    // Assert
    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
    expect(redirectCall.pathname).toBe('/auth/signin')
    expect(redirectCall.searchParams.get('callbackUrl')).toBe('/dashboard')
  })

  it('should allow access to dashboard for authenticated users', async () => {
    // Arrange
    const request = {
      nextUrl: {
        pathname: '/dashboard',
      },
      url: 'http://localhost:3000/dashboard',
    }

    // Mock the getToken function to return a token (authenticated user)
    ;(getToken as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
      role: 'SUPPLIER',
    })

    // Act
    const response = await middleware(request as any)

    // Assert
    expect(NextResponse.next).toHaveBeenCalled()
    expect(response).toBe('next-response')
  })
})
