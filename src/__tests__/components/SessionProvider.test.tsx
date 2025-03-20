import { render, screen } from '@testing-library/react'
import SessionProvider from '@/components/auth/SessionProvider'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='next-auth-session-provider'>{children}</div>
  ),
}))

describe('SessionProvider', () => {
  it('renders the NextAuth SessionProvider with children', () => {
    // Arrange
    const mockSession = {
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2023-01-01',
    }

    // Act
    render(
      <SessionProvider session={mockSession as any}>
        <div data-testid='child-content'>Child Content</div>
      </SessionProvider>
    )

    // Assert
    expect(screen.getByTestId('next-auth-session-provider')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('works with a null session', () => {
    // Arrange & Act
    render(
      <SessionProvider session={null}>
        <div data-testid='child-content'>Child Content</div>
      </SessionProvider>
    )

    // Assert
    expect(screen.getByTestId('next-auth-session-provider')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})
