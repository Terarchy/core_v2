'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontalIcon,
  Send,
  ShieldCheckIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from 'lucide-react'
import { api } from '@/lib/api/trpc'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

// Define the invoice type
type Invoice = {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  issueDate: Date
  dueDate: Date
  status: string
  description?: string
  buyer: {
    id: string
    name?: string
    companyName?: string
  }
}

type InvoicesListProps = {
  invoices: Invoice[]
  onCreateNew: () => void
}

export default function InvoicesList({
  invoices,
  onCreateNew,
}: InvoicesListProps) {
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const utils = api.useContext()

  // Submit invoice for approval
  const submitInvoiceMutation = api.invoice.submitInvoice.useMutation({
    onSuccess: () => {
      toast.success('Invoice Submitted', {
        description: 'Your invoice has been submitted for approval.',
      })
      void utils.invoice.getMyInvoices.invalidate()
    },
    onError: (error) => {
      toast.error('Error', {
        description: error.message,
      })
    },
  })

  // Tokenize invoice
  const tokenizeInvoiceMutation = api.invoice.tokenizeInvoice.useMutation({
    onSuccess: () => {
      toast.success('Invoice Tokenized', {
        description:
          'Your invoice has been tokenized and is now available for financing.',
      })
      void utils.invoice.getMyInvoices.invalidate()
    },
    onError: (error) => {
      toast.error('Error', {
        description: error.message,
      })
    },
  })

  // Handle invoice actions
  const handleInvoiceAction = (action: string, invoice: Invoice) => {
    switch (action) {
      case 'view':
        setViewingInvoice(invoice)
        break
      case 'submit':
        submitInvoiceMutation.mutate({ invoiceId: invoice.id })
        break
      case 'tokenize':
        tokenizeInvoiceMutation.mutate({ invoiceId: invoice.id })
        break
      default:
        break
    }
  }

  // Get the status badge for an invoice
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline' | null
        label: string
        icon?: React.ReactNode
      }
    > = {
      DRAFT: {
        variant: 'outline',
        label: 'Draft',
        icon: <AlertCircleIcon className='h-3 w-3 mr-1' />,
      },
      PENDING_APPROVAL: {
        variant: 'secondary',
        label: 'Pending Approval',
        icon: <Send className='h-3 w-3 mr-1' />,
      },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
      VERIFIED: {
        variant: 'default',
        label: 'Verified',
        icon: <CheckCircleIcon className='h-3 w-3 mr-1' />,
      },
      TOKENIZED: {
        variant: 'default',
        label: 'Tokenized',
        icon: <ShieldCheckIcon className='h-3 w-3 mr-1' />,
      },
      PARTIALLY_FINANCED: { variant: 'default', label: 'Partially Financed' },
      FULLY_FINANCED: { variant: 'default', label: 'Fully Financed' },
      PARTIALLY_PAID: { variant: 'default', label: 'Partially Paid' },
      PAID: { variant: 'default', label: 'Paid' },
      OVERDUE: { variant: 'destructive', label: 'Overdue' },
    }

    const { variant, label, icon } = statusMap[status] || {
      variant: 'outline',
      label: status,
    }

    return (
      <Badge variant={variant}>
        {icon && icon}
        {label}
      </Badge>
    )
  }

  // Get available actions based on invoice status
  const getAvailableActions = (invoice: Invoice) => {
    const actions: { label: string; action: string }[] = [
      { label: 'View Details', action: 'view' },
    ]

    // Add status-specific actions
    if (invoice.status === 'DRAFT') {
      actions.push({ label: 'Submit for Approval', action: 'submit' })
    } else if (invoice.status === 'VERIFIED') {
      actions.push({ label: 'Tokenize Invoice', action: 'tokenize' })
    }

    return actions
  }

  if (invoices.length === 0) {
    return (
      <div className='text-center py-10'>
        <h3 className='text-lg font-medium text-muted-foreground'>
          No invoices found
        </h3>
        <p className='text-sm mt-2'>Create your first invoice to get started</p>
        <Button onClick={onCreateNew} className='mt-4'>
          Create Invoice
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className='font-medium'>
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>
                {invoice.buyer.companyName || invoice.buyer.name || 'Unknown'}
              </TableCell>
              <TableCell>
                {formatCurrency(invoice.amount, invoice.currency)}
              </TableCell>
              <TableCell>{formatDate(invoice.issueDate)}</TableCell>
              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                      <span className='sr-only'>Open menu</span>
                      <MoreHorizontalIcon className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {getAvailableActions(invoice).map((action) => (
                      <DropdownMenuItem
                        key={action.action}
                        onClick={() =>
                          handleInvoiceAction(action.action, invoice)
                        }
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Invoice Details Dialog */}
      <Dialog
        open={!!viewingInvoice}
        onOpenChange={(open) => !open && setViewingInvoice(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Invoice #{viewingInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          {viewingInvoice && (
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Status</div>
                <div>{getStatusBadge(viewingInvoice.status)}</div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Amount</div>
                <div>
                  {formatCurrency(
                    viewingInvoice.amount,
                    viewingInvoice.currency
                  )}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Buyer</div>
                <div>
                  {viewingInvoice.buyer.companyName ||
                    viewingInvoice.buyer.name}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Issue Date</div>
                <div>{formatDate(viewingInvoice.issueDate)}</div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Due Date</div>
                <div>{formatDate(viewingInvoice.dueDate)}</div>
              </div>
              {viewingInvoice.description && (
                <div className='grid grid-cols-1 gap-2'>
                  <div className='text-sm font-medium'>Description</div>
                  <div className='text-sm'>{viewingInvoice.description}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setViewingInvoice(null)}>
              Close
            </Button>
            {viewingInvoice?.status === 'DRAFT' && (
              <Button
                onClick={() => {
                  handleInvoiceAction('submit', viewingInvoice)
                  setViewingInvoice(null)
                }}
              >
                Submit for Approval
              </Button>
            )}
            {viewingInvoice?.status === 'VERIFIED' && (
              <Button
                onClick={() => {
                  handleInvoiceAction('tokenize', viewingInvoice)
                  setViewingInvoice(null)
                }}
              >
                Tokenize Invoice
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
