import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUpPage from '@/app/auth/signup/page'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/trpc'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

// Mock tRPC
const mockUseMutation = jest.fn()
jest.mock('@/lib/api/trpc', () => ({
  api: {
    user: {
      register: {
        useMutation: () => mockUseMutation(),
      },
    },
  },
}))

describe('SignUpPage', () => {
  const mockPush = jest.fn()
  const mockMutateAsync = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    mockUseMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
      error: null,
    })
  })

  it('renders the sign up form', () => {
    render(<SignUpPage />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/password \(min\. 8 characters\)/i)
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/company name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('allows entering registration information', () => {
    render(<SignUpPage />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(
      screen.getByPlaceholderText(/password \(min\. 8 characters\)/i),
      {
        target: { value: 'password123' },
      }
    )
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'SUPPLIER' },
    })
    fireEvent.change(screen.getByPlaceholderText(/company name/i), {
      target: { value: 'Test Company' },
    })

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Test User')
    expect(screen.getByLabelText(/email address/i)).toHaveValue(
      'test@example.com'
    )
    expect(
      screen.getByPlaceholderText(/password \(min\. 8 characters\)/i)
    ).toHaveValue('password123')
    expect(screen.getByPlaceholderText(/confirm password/i)).toHaveValue(
      'password123'
    )
    expect(screen.getByLabelText(/account type/i)).toHaveValue('SUPPLIER')
    expect(screen.getByPlaceholderText(/company name/i)).toHaveValue(
      'Test Company'
    )
  })

  it('attempts to submit the form', async () => {
    mockMutateAsync.mockResolvedValue({ success: true })

    render(<SignUpPage />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(
      screen.getByPlaceholderText(/password \(min\. 8 characters\)/i),
      {
        target: { value: 'password123' },
      }
    )
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/account type/i), {
      target: { value: 'SUPPLIER' },
    })
    fireEvent.change(screen.getByPlaceholderText(/company name/i), {
      target: { value: 'Test Company' },
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    // Wait for the mutation to be called
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'SUPPLIER',
          companyName: 'Test Company',
          // Allow any values for the optional fields
          address: expect.any(String),
          country: expect.any(String),
          companyRegistrationNo: expect.any(String),
          phoneNumber: expect.any(String),
        })
      )
    })
  })

  it('provides a link to the sign in page', () => {
    render(<SignUpPage />)

    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/auth/signin')
  })
})
