import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import KycStatusCard from '@/components/dashboard/KycStatusCard'
import { api } from '@/lib/api/trpc'
import { formatDate } from '@/lib/utils/formatters'

// Mock the trpc hooks
jest.mock('@/lib/api/trpc', () => ({
  api: {
    useContext: jest.fn(() => ({
      kyc: {
        getMyKycStatus: {
          invalidate: jest.fn(),
        },
      },
    })),
    kyc: {
      submitKycDocuments: {
        useMutation: jest.fn(({ onSuccess, onError, onSettled }) => ({
          mutate: jest.fn(async (data) => {
            onSuccess?.(data, null, null)
            onSettled?.()
            return Promise.resolve({ success: true })
          }),
          isLoading: false,
        })),
      },
    },
  },
}))

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}))

// Mock the date formatter
jest.mock('@/lib/utils/formatters', () => ({
  formatDate: jest.fn((date) => '2023-01-01'),
}))

// Mock file upload
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} data-testid='mock-link'>
      {children}
    </a>
  ),
}))

describe('KycStatusCard', () => {
  const mockFileUpload = jest.fn((file) =>
    Promise.resolve(`https://storage.example.com/${file.name}`)
  )

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the global.URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-url')
  })

  it('renders the Pending KYC status correctly', () => {
    render(<KycStatusCard kycStatus='PENDING' />)

    expect(screen.getByText('KYC Pending')).toBeInTheDocument()
    expect(
      screen.getByText('Please submit your KYC documents to get verified.')
    ).toBeInTheDocument()
    expect(screen.getByText('Required Documents')).toBeInTheDocument()

    // Check for upload buttons
    const uploadButtons = screen.getAllByText('Upload')
    expect(uploadButtons.length).toBe(3) // Three document types
  })

  it('renders the In Progress KYC status correctly', () => {
    render(<KycStatusCard kycStatus='IN_PROGRESS' />)

    expect(screen.getByText('KYC In Progress')).toBeInTheDocument()
    expect(
      screen.getByText('Your KYC documents are being reviewed.')
    ).toBeInTheDocument()
  })

  it('renders the Approved KYC status correctly', () => {
    render(<KycStatusCard kycStatus='APPROVED' />)

    expect(screen.getByText('KYC Approved')).toBeInTheDocument()
    expect(
      screen.getByText('Your identity has been verified.')
    ).toBeInTheDocument()

    // Upload buttons should be disabled
    const uploadButtons = screen.getAllByText('Upload')
    uploadButtons.forEach((button) => {
      expect(button.closest('button')).toBeDisabled()
    })
  })

  it('renders the Rejected KYC status correctly', () => {
    const kycDetails = {
      id: '123',
      userId: '456',
      amlCheckCompleted: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
      notes: 'Missing information in documents',
    }

    render(<KycStatusCard kycStatus='REJECTED' kycDetails={kycDetails} />)

    expect(screen.getByText('KYC Rejected')).toBeInTheDocument()
    expect(
      screen.getByText('Missing information in documents')
    ).toBeInTheDocument()
  })

  it('displays document status correctly when documents are uploaded', () => {
    const kycDetails = {
      id: '123',
      userId: '456',
      identificationDocUrl: 'https://example.com/id.pdf',
      addressProofUrl: null,
      businessRegDocUrl: 'https://example.com/business.pdf',
      amlCheckCompleted: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    }

    render(<KycStatusCard kycStatus='IN_PROGRESS' kycDetails={kycDetails} />)

    // Check document statuses
    expect(screen.getAllByText('Uploaded')[0]).toBeInTheDocument() // ID document
    expect(screen.getByText('Not Uploaded')).toBeInTheDocument() // Address proof
    expect(screen.getAllByText('Uploaded')[1]).toBeInTheDocument() // Business registration
  })

  it('displays additional information when kycDetails is provided', () => {
    const kycDetails = {
      id: '123',
      userId: '456',
      amlCheckCompleted: true,
      amlCheckStatus: 'PASSED',
      amlCheckDate: new Date('2023-01-15'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    }

    render(<KycStatusCard kycStatus='APPROVED' kycDetails={kycDetails} />)

    expect(screen.getByText('Additional Information')).toBeInTheDocument()
    expect(screen.getByText('Application Date:')).toBeInTheDocument()
    expect(screen.getByText('Last Updated:')).toBeInTheDocument()
    expect(screen.getByText('AML Check:')).toBeInTheDocument()
    expect(screen.getByText('Passed')).toBeInTheDocument()

    // Formatting should be called for dates
    expect(formatDate).toHaveBeenCalledTimes(3)
  })

  it('handles file upload and submission correctly', async () => {
    const mockKycMutation = jest.fn()

    // Override the mock for this test
    ;(api.kyc.submitKycDocuments.useMutation as jest.Mock).mockReturnValue({
      mutate: mockKycMutation,
      isLoading: false,
    })

    render(<KycStatusCard kycStatus='PENDING' />)

    // Create a mock file
    const file = new File(['dummy content'], 'id-document.pdf', {
      type: 'application/pdf',
    })

    // Get the file input and simulate upload
    const fileInput = document.getElementById(
      'id-doc-upload'
    ) as HTMLInputElement

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    })

    fireEvent.change(fileInput)

    // Check that mutation was called with correct field
    await waitFor(() => {
      expect(mockKycMutation).toHaveBeenCalledWith(
        expect.objectContaining({ identificationDocUrl: expect.any(String) })
      )
    })
  })

  it('shows help section with correct link', () => {
    render(<KycStatusCard kycStatus='PENDING' />)

    const helpLink = screen.getByText('Get help')
    expect(helpLink).toBeInTheDocument()
    expect(helpLink.getAttribute('href')).toBe('/support/kyc')
  })
})
