import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignInPage from '@/app/auth/signin/page'
import { signIn } from 'next-auth/react'

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the sign in form', () => {
    render(<SignInPage />)

    // Check for essential form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles form submission correctly', async () => {
    // Mock successful sign in
    ;(signIn as jest.Mock).mockResolvedValueOnce({ ok: true })

    render(<SignInPage />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    // Submit the form by clicking the submit button
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    // Verify signIn was called with correct parameters
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        })
      )
    })
  })

  it('provides link to sign up page', () => {
    render(<SignInPage />)

    // Use getByText instead of getByRole to find the link
    const signUpLink = screen.getByText(/create a new account/i)
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/auth/signup')
  })
})
