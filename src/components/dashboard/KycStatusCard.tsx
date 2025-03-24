'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldIcon,
  UploadIcon,
} from 'lucide-react'
import { api } from '@/lib/api/trpc'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/formatters'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

// Mock file upload - in a real application, this would upload to a storage service
const simulateFileUpload = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulating a returned URL
      resolve(`https://storage.example.com/${file.name}`)
    }, 1000)
  })
}

type KycDetails = {
  id: string
  userId: string
  identificationDocUrl?: string | null
  addressProofUrl?: string | null
  businessRegDocUrl?: string | null
  taxRegistrationUrl?: string | null
  financialStatementsUrl?: string | null
  amlCheckCompleted: boolean
  amlCheckDate?: Date | null
  amlCheckStatus?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

type KycStatusCardProps = {
  kycStatus: string
  kycDetails?: KycDetails | null
}

export default function KycStatusCard({
  kycStatus,
  kycDetails,
}: KycStatusCardProps) {
  const utils = api.useContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // Submit KYC mutation
  const submitKycMutation = api.kyc.submitKycDocuments.useMutation({
    onSuccess: () => {
      toast.success('KYC Documents Submitted', {
        description: 'Your KYC documents have been submitted for review.',
      })
      void utils.kyc.getMyKycStatus.invalidate()
    },
    onError: (error) => {
      toast.error('Error', {
        description: error.message,
      })
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  // Handle file upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField(fieldName)

    try {
      // In a real application, upload to a storage service
      const fileUrl = await simulateFileUpload(file)

      // Create a payload with only the updated field
      const payload: Record<string, string> = {}
      payload[fieldName] = fileUrl

      // Submit to API
      submitKycMutation.mutate(payload as any)
    } catch (error) {
      toast.error('Upload Error', {
        description: 'Failed to upload file. Please try again.',
      })
    } finally {
      setUploadingField(null)
    }
  }

  // Get status info based on KYC status
  const getStatusInfo = () => {
    switch (kycStatus) {
      case 'PENDING':
        return {
          icon: <ClockIcon className='w-8 h-8 text-gray-500' />,
          color: 'bg-gray-200',
          textColor: 'text-gray-700',
          title: 'KYC Pending',
          description: 'Please submit your KYC documents to get verified.',
          progress: 0,
        }
      case 'IN_PROGRESS':
        return {
          icon: <ShieldIcon className='w-8 h-8 text-blue-500' />,
          color: 'bg-blue-100',
          textColor: 'text-blue-700',
          title: 'KYC In Progress',
          description: 'Your KYC documents are being reviewed.',
          progress: 50,
        }
      case 'APPROVED':
        return {
          icon: <CheckCircleIcon className='w-8 h-8 text-green-500' />,
          color: 'bg-green-100',
          textColor: 'text-green-700',
          title: 'KYC Approved',
          description: 'Your identity has been verified.',
          progress: 100,
        }
      case 'REJECTED':
        return {
          icon: <XCircleIcon className='w-8 h-8 text-red-500' />,
          color: 'bg-red-100',
          textColor: 'text-red-700',
          title: 'KYC Rejected',
          description:
            kycDetails?.notes ||
            'Your KYC application was rejected. Please update your information and try again.',
          progress: 0,
        }
      default:
        return {
          icon: <ClockIcon className='w-8 h-8 text-gray-500' />,
          color: 'bg-gray-200',
          textColor: 'text-gray-700',
          title: 'KYC Status Unknown',
          description: 'Please contact support.',
          progress: 0,
        }
    }
  }

  const { icon, color, textColor, title, description, progress } =
    getStatusInfo()

  // Document status - for displaying which documents have been uploaded
  const getDocumentStatus = (url?: string | null) => {
    if (!url) return 'Not Uploaded'
    return 'Uploaded'
  }

  return (
    <div className='space-y-6'>
      {/* Status Card */}
      <Card className={`${color} border-0`}>
        <CardContent className='p-6'>
          <div className='flex items-center space-x-4'>
            <div>{icon}</div>
            <div>
              <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
              <p className='text-sm text-gray-700'>{description}</p>
            </div>
          </div>
          <div className='mt-4'>
            <Progress value={progress} className='h-2' />
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      <div className='space-y-6 mt-8'>
        <h3 className='text-lg font-medium'>Required Documents</h3>
        <div className='space-y-6'>
          {/* Identification Document */}
          <div className='flex items-center justify-between p-6 border rounded-md'>
            <div>
              <h4 className='font-medium mb-2'>Identification Document</h4>
              <p className='text-sm text-gray-500'>
                {getDocumentStatus(kycDetails?.identificationDocUrl)}
              </p>
            </div>
            <div>
              <Button
                variant='outline'
                size='sm'
                disabled={
                  kycStatus === 'APPROVED' ||
                  uploadingField === 'identificationDocUrl'
                }
                onClick={() =>
                  document.getElementById('id-doc-upload')?.click()
                }
              >
                {uploadingField === 'identificationDocUrl' ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <UploadIcon className='w-4 h-4 mr-2' />
                    Upload
                  </>
                )}
              </Button>
              <input
                type='file'
                id='id-doc-upload'
                className='hidden'
                onChange={(e) => handleFileUpload(e, 'identificationDocUrl')}
                accept='image/*, application/pdf'
              />
            </div>
          </div>

          {/* Address Proof */}
          <div className='flex items-center justify-between p-6 border rounded-md'>
            <div>
              <h4 className='font-medium mb-2'>Proof of Address</h4>
              <p className='text-sm text-gray-500'>
                {getDocumentStatus(kycDetails?.addressProofUrl)}
              </p>
            </div>
            <div>
              <Button
                variant='outline'
                size='sm'
                disabled={
                  kycStatus === 'APPROVED' ||
                  uploadingField === 'addressProofUrl'
                }
                onClick={() =>
                  document.getElementById('address-proof-upload')?.click()
                }
              >
                {uploadingField === 'addressProofUrl' ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <UploadIcon className='w-4 h-4 mr-2' />
                    Upload
                  </>
                )}
              </Button>
              <input
                type='file'
                id='address-proof-upload'
                className='hidden'
                onChange={(e) => handleFileUpload(e, 'addressProofUrl')}
                accept='image/*, application/pdf'
              />
            </div>
          </div>

          {/* Business Registration (for suppliers) */}
          <div className='flex items-center justify-between p-6 border rounded-md'>
            <div>
              <h4 className='font-medium mb-2'>Business Registration</h4>
              <p className='text-sm text-gray-500'>
                {getDocumentStatus(kycDetails?.businessRegDocUrl)}
              </p>
            </div>
            <div>
              <Button
                variant='outline'
                size='sm'
                disabled={
                  kycStatus === 'APPROVED' ||
                  uploadingField === 'businessRegDocUrl'
                }
                onClick={() =>
                  document.getElementById('business-reg-upload')?.click()
                }
              >
                {uploadingField === 'businessRegDocUrl' ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <UploadIcon className='w-4 h-4 mr-2' />
                    Upload
                  </>
                )}
              </Button>
              <input
                type='file'
                id='business-reg-upload'
                className='hidden'
                onChange={(e) => handleFileUpload(e, 'businessRegDocUrl')}
                accept='image/*, application/pdf'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {kycDetails && (
        <div className='mt-6 border-t pt-4'>
          <h3 className='text-sm font-medium text-gray-500'>
            Additional Information
          </h3>
          <div className='mt-2 text-sm'>
            <div className='grid grid-cols-2 gap-2'>
              <div>Application Date:</div>
              <div>{formatDate(kycDetails.createdAt)}</div>

              {kycDetails.updatedAt && (
                <>
                  <div>Last Updated:</div>
                  <div>{formatDate(kycDetails.updatedAt)}</div>
                </>
              )}

              {kycDetails.amlCheckCompleted && (
                <>
                  <div>AML Check:</div>
                  <div>
                    {kycDetails.amlCheckStatus === 'PASSED' ? (
                      <span className='text-green-600'>Passed</span>
                    ) : (
                      <span className='text-red-600'>Failed</span>
                    )}
                    {kycDetails.amlCheckDate &&
                      ` on ${formatDate(kycDetails.amlCheckDate)}`}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className='text-center mt-6'>
        <p className='text-sm text-gray-500'>
          Having trouble with KYC verification?{' '}
          <Link href='/support/kyc' className='text-blue-600 hover:underline'>
            Get help
          </Link>
        </p>
      </div>
    </div>
  )
}
