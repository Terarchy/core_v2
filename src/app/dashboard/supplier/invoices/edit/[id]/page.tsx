'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import EditRejectedInvoiceForm from '@/components/dashboard/supplier/EditRejectedInvoiceForm'
import { useSession } from 'next-auth/react'

export default function EditRejectedInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null)

  // Redirect if not a supplier
  useEffect(() => {
    if (status === 'authenticated') {
      if (
        session?.user?.role !== 'SUPPLIER' &&
        session?.user?.role !== 'ADMIN'
      ) {
        router.push('/dashboard')
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, session, router])

  const invoiceId = params.id as string

  // Handle form success
  const handleSuccess = () => {
    router.push('/dashboard/supplier')
  }

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/supplier')
  }

  // Display loading state while checking session
  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-pulse flex space-x-2'>
          <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
          <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
          <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='container p-4 md:p-6 mx-auto max-w-5xl'>
      <div className='flex items-center mb-6'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push('/dashboard/supplier')}
          className='mr-4'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
        <h1 className='text-2xl font-bold'>Edit Rejected Invoice</h1>
      </div>

      <Card>
        <CardHeader className='pb-4'>
          <CardTitle>Edit Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className='p-4 mb-4 text-red-700 bg-red-100 rounded-md'>
              {error}
            </div>
          ) : (
            <EditRejectedInvoiceForm
              invoiceId={invoiceId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
