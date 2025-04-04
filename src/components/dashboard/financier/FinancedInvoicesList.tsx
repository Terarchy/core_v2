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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

// Define financing interface
type Financing = {
  id: string
  amount: number | string | { toString: () => string }
  interestRate: number | string | { toString: () => string }
  status: string
  fundedDate: Date | string
  createdAt: Date | string
  invoice: {
    id: string
    invoiceNumber: string
    amount: number | string | { toString: () => string }
    currency: string
    dueDate: Date | string
    status: string
    supplier: {
      id: string
      name?: string | null
      companyName?: string | null
    }
    buyer: {
      id: string
      name?: string | null
      companyName?: string | null
    }
    payments?: {
      id: string
      amount: number | string | { toString: () => string }
      paymentDate: Date | string
    }[]
  }
}

type FinancedInvoicesListProps = {
  financings: Financing[]
}

export default function FinancedInvoicesList({
  financings,
}: FinancedInvoicesListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedFinancing, setSelectedFinancing] = useState<Financing | null>(
    null
  )

  // Filter financings by status
  const filteredFinancings = financings.filter((financing) => {
    if (statusFilter === 'ALL') return true
    return financing.status === statusFilter
  })

  // Get status badge for a financing
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant='outline' className='bg-blue-50 text-blue-700'>
            <Clock className='h-3 w-3 mr-1' />
            Active
          </Badge>
        )
      case 'REPAID':
        return (
          <Badge variant='outline' className='bg-green-50 text-green-700'>
            <CheckCircle2 className='h-3 w-3 mr-1' />
            Repaid
          </Badge>
        )
      case 'DEFAULTED':
        return (
          <Badge variant='outline' className='bg-red-50 text-red-700'>
            <AlertTriangle className='h-3 w-3 mr-1' />
            Defaulted
          </Badge>
        )
      default:
        return (
          <Badge variant='outline'>
            <Info className='h-3 w-3 mr-1' />
            {status}
          </Badge>
        )
    }
  }

  // Get percentage of repayment (calculate based on payments)
  const getRepaymentPercentage = (financing: Financing) => {
    if (
      !financing.invoice.payments ||
      financing.invoice.payments.length === 0
    ) {
      return 0
    }

    const totalPaid = financing.invoice.payments.reduce(
      (sum, payment) =>
        sum +
        (typeof payment.amount === 'object'
          ? Number(payment.amount.toString())
          : Number(payment.amount)),
      0
    )

    const financingAmount =
      typeof financing.amount === 'object'
        ? Number(financing.amount.toString())
        : Number(financing.amount)

    return Math.min(Math.round((totalPaid / financingAmount) * 100), 100)
  }

  // View details of a financing
  const handleViewDetails = (financing: Financing) => {
    setSelectedFinancing(financing)
  }

  if (financings.length === 0) {
    return (
      <div className='text-center py-10'>
        <h3 className='text-lg font-medium text-muted-foreground'>
          No investments yet
        </h3>
        <p className='text-sm mt-2'>
          You haven&apos;t financed any invoices yet.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-medium'>
          My Investments ({filteredFinancings.length})
        </h3>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All Investments</SelectItem>
            <SelectItem value='ACTIVE'>Active Only</SelectItem>
            <SelectItem value='REPAID'>Repaid Only</SelectItem>
            <SelectItem value='DEFAULTED'>Defaulted Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Investment</TableHead>
            <TableHead>Interest Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Investment Date</TableHead>
            <TableHead>Repayment</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFinancings.map((financing) => (
            <TableRow key={financing.id}>
              <TableCell className='font-medium'>
                {financing.invoice.invoiceNumber}
              </TableCell>
              <TableCell>
                {financing.invoice.supplier.companyName ||
                  financing.invoice.supplier.name ||
                  'Unknown'}
              </TableCell>
              <TableCell>
                {formatCurrency(
                  typeof financing.amount === 'object'
                    ? Number(financing.amount.toString())
                    : Number(financing.amount),
                  financing.invoice.currency
                )}
              </TableCell>
              <TableCell>
                {typeof financing.interestRate === 'object'
                  ? `${Number(financing.interestRate.toString()).toFixed(2)}%`
                  : `${Number(financing.interestRate).toFixed(2)}%`}
              </TableCell>
              <TableCell>{getStatusBadge(financing.status)}</TableCell>
              <TableCell>{formatDate(financing.fundedDate)}</TableCell>
              <TableCell>
                <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                  <div
                    className='bg-blue-600 h-2.5 rounded-full'
                    style={{
                      width: `${getRepaymentPercentage(financing)}%`,
                    }}
                  ></div>
                </div>
                <span className='text-xs mt-1 inline-block'>
                  {getRepaymentPercentage(financing)}%
                </span>
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleViewDetails(financing)}
                >
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Financing Details Dialog */}
      <Dialog
        open={!!selectedFinancing}
        onOpenChange={(open) => !open && setSelectedFinancing(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription>
              {selectedFinancing && (
                <>Invoice #{selectedFinancing.invoice.invoiceNumber}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedFinancing && (
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Status</div>
                <div>{getStatusBadge(selectedFinancing.status)}</div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Investment Amount</div>
                <div>
                  {formatCurrency(
                    typeof selectedFinancing.amount === 'object'
                      ? Number(selectedFinancing.amount.toString())
                      : Number(selectedFinancing.amount),
                    selectedFinancing.invoice.currency
                  )}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Interest Rate</div>
                <div>
                  {typeof selectedFinancing.interestRate === 'object'
                    ? `${Number(
                        selectedFinancing.interestRate.toString()
                      ).toFixed(2)}%`
                    : `${Number(selectedFinancing.interestRate).toFixed(2)}%`}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Invoice Total</div>
                <div>
                  {formatCurrency(
                    typeof selectedFinancing.invoice.amount === 'object'
                      ? Number(selectedFinancing.invoice.amount.toString())
                      : Number(selectedFinancing.invoice.amount),
                    selectedFinancing.invoice.currency
                  )}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Supplier</div>
                <div>
                  {selectedFinancing.invoice.supplier.companyName ||
                    selectedFinancing.invoice.supplier.name}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Buyer</div>
                <div>
                  {selectedFinancing.invoice.buyer.companyName ||
                    selectedFinancing.invoice.buyer.name}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Due Date</div>
                <div>{formatDate(selectedFinancing.invoice.dueDate)}</div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Investment Date</div>
                <div>{formatDate(selectedFinancing.fundedDate)}</div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm font-medium'>Repayment Progress</div>
                <div>
                  <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                    <div
                      className='bg-blue-600 h-2.5 rounded-full'
                      style={{
                        width: `${getRepaymentPercentage(selectedFinancing)}%`,
                      }}
                    ></div>
                  </div>
                  <span className='text-xs mt-1 inline-block'>
                    {getRepaymentPercentage(selectedFinancing)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setSelectedFinancing(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
