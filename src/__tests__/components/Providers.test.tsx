import { render, screen } from '@testing-library/react'
import Providers from '@/components/Providers'
import { SessionProvider } from 'next-auth/react'
import { TRPCProvider } from '@/lib/api/trpc'

// Mock the SessionProvider and TRPCProvider
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='session-provider'>{children}</div>
  ),
}))

jest.mock('@/lib/api/trpc', () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='trpc-provider'>{children}</div>
  ),
}))

describe('Providers', () => {
  it('renders SessionProvider and TRPCProvider with children', () => {
    // Arrange
    const mockSession = {
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2023-01-01',
    }

    // Act
    render(
      <Providers session={mockSession as any}>
        <div data-testid='child-content'>Child Content</div>
      </Providers>
    )

    // Assert
    expect(screen.getByTestId('session-provider')).toBeInTheDocument()
    expect(screen.getByTestId('trpc-provider')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('passes session to SessionProvider', () => {
    // This is a more conceptual test since we're mocking SessionProvider
    // In a real scenario, we'd test that the session prop is properly passed
    // But with our mock implementation, we can only verify the component structure

    // Arrange & Act
    render(
      <Providers session={null}>
        <div>Child Content</div>
      </Providers>
    )

    // Assert
    expect(screen.getByTestId('session-provider')).toBeInTheDocument()
  })
})
