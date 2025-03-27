'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api/trpc'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { data: invoice, isLoading: isLoadingInvoice } = api.buyer.getInvoice.useQuery({
    id: params.id,
  })

  const approveMutation = api.buyer.approveInvoice.useMutation({
    onSuccess: () => {
      toast.success('Invoice approved successfully')
      router.push('/dashboard/buyer')
    },
    onError: (error) => {
      toast.error('Error approving invoice', {
        description: error.message,
      })
    },
  })

  const rejectMutation = api.buyer.rejectInvoice.useMutation({
    onSuccess: () => {
      toast.success('Invoice rejected successfully')
      router.push('/dashboard/buyer')
    },
    onError: (error) => {
      toast.error('Error rejecting invoice', {
        description: error.message,
      })
    },
  })

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await approveMutation.mutateAsync({ id: params.id })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setIsLoading(true)
    try {
      await rejectMutation.mutateAsync({
        id: params.id,
        reason,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}/pdf`)
      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice?.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Error',
        description: 'Failed to download invoice PDF',
        variant: 'destructive',
      })
    }
  }

  if (isLoadingInvoice) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-pulse text-gray-400'>Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-gray-400'>Invoice not found</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-6'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold'>Invoice Details</h1>
          <Button onClick={handleDownload} variant='outline'>
            Download PDF
          </Button>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
              <CardDescription>Details of the invoice</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <div className='text-sm font-medium text-gray-500'>Invoice Number</div>
                <div className='mt-1'>{invoice.invoiceNumber}</div>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>Amount</div>
                <div className='mt-1'>{formatCurrency(invoice.amount)}</div>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>Status</div>
                <div className='mt-1'>{invoice.status}</div>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>Created At</div>
                <div className='mt-1'>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>Due Date</div>
                <div className='mt-1'>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>Description</div>
                <div className='mt-1'>{invoice.description}</div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
              <CardDescription>Details of the supplier</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <div className='text-sm font-medium text-gray-500'>Company Name</div>
                <div className='mt-1'>{invoice.supplier.companyName || invoice.supplier.name}</div>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>Contact Name</div>
                <div className='mt-1'>{invoice.supplier.name}</div>
              </div>
              <div>
                <div className='text-sm font-medium text-gray-500'>Email</div>
                <div className='mt-1'>{invoice.supplier.email}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Actions */}
        {invoice.status === 'PENDING_APPROVAL' && (
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Invoice Actions</CardTitle>
              <CardDescription>Approve or reject this invoice</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <div className='text-sm font-medium text-gray-500 mb-2'>
                  Rejection Reason (if rejecting)
                </div>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder='Enter reason for rejection...'
                  className='min-h-[100px]'
                />
              </div>
              <div className='flex space-x-4'>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className='bg-green-600 hover:bg-green-700'
                >
                  Approve Invoice
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  variant='destructive'
                >
                  Reject Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 