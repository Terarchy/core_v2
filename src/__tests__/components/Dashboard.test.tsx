import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  redirect: jest.fn(),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />
  },
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays loading state when session is loading', () => {
    // Mock loading session
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(<DashboardPage />)

    // Check for loading indicator
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays redirecting message when authenticated', () => {
    // Mock authenticated session
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'SUPPLIER',
        },
        expires: '2023-01-01',
      },
      status: 'authenticated',
    })

    // Create a mock for useRouter and push method
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    render(<DashboardPage />)

    // Check that redirecting message is displayed
    expect(
      screen.getByText(/redirecting to your dashboard/i)
    ).toBeInTheDocument()
  })
})
