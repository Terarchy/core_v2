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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AlertCircle, Info, Shield } from 'lucide-react'
import { api } from '@/lib/api/trpc'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Define the investment form schema
const investmentFormSchema = z.object({
  invoiceId: z.string(),
  amount: z.coerce
    .number()
    .positive('Amount must be greater than zero')
    .min(1, 'Minimum amount is 1'),
  interestRate: z.coerce
    .number()
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%'),
})

type InvestmentFormValues = z.infer<typeof investmentFormSchema>

// Define the invoice type for opportunities
type TokenizedInvoice = {
  id: string
  invoiceNumber: string
  amount: number | string | { toString: () => string }
  currency: string
  issueDate: Date | string
  dueDate: Date | string
  status: string
  riskScore?: number | string | { toString: () => string }
  riskCategory?: string
  supplier: {
    id: string
    name?: string | null
    companyName?: string | null
    kycStatus?: string
  }
  buyer: {
    id: string
    name?: string | null
    companyName?: string | null
  }
}

type InvestmentOpportunitiesListProps = {
  invoices: TokenizedInvoice[]
}

export default function InvestmentOpportunitiesList({
  invoices,
}: InvestmentOpportunitiesListProps) {
  const [riskFilter, setRiskFilter] = useState<string>('ALL')
  const [selectedInvoice, setSelectedInvoice] =
    useState<TokenizedInvoice | null>(null)
  const utils = api.useUtils()

  // Filter invoices by risk category
  const filteredInvoices = invoices.filter((invoice) => {
    if (riskFilter === 'ALL') return true
    return invoice.riskCategory === riskFilter
  })

  // Finance invoice mutation
  const financeInvoiceMutation = api.financing.financeInvoice.useMutation({
    onSuccess: () => {
      toast.success('Investment Successful', {
        description: 'You have successfully financed this invoice.',
      })
      void utils.invoice.getTokenizedInvoices.invalidate()
      void utils.financing.getFinancedInvoices.invalidate()
      void utils.financing.getFinancingAnalytics.invalidate()
      setSelectedInvoice(null)
    },
    onError: (error) => {
      toast.error('Investment Failed', {
        description: error.message,
      })
    },
  })

  // Setup form for investment dialog
  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      invoiceId: '',
      amount: 0,
      interestRate: 5,
    },
  })

  // Handle invoice selection for investment
  const handleInvestClick = (invoice: TokenizedInvoice) => {
    setSelectedInvoice(invoice)
    form.reset({
      invoiceId: invoice.id,
      amount: 0,
      interestRate: 5,
    })
  }

  // Handle investment form submission
  const onSubmit = (values: InvestmentFormValues) => {
    financeInvoiceMutation.mutate({
      invoiceId: values.invoiceId,
      amount: values.amount,
      interestRate: values.interestRate,
    })
  }

  // Get risk badge for an invoice
  const getRiskBadge = (riskCategory?: string) => {
    switch (riskCategory) {
      case 'LOW':
        return (
          <Badge variant='outline' className='bg-green-50 text-green-700'>
            <Shield className='h-3 w-3 mr-1' />
            Low Risk
          </Badge>
        )
      case 'MEDIUM':
        return (
          <Badge variant='outline' className='bg-yellow-50 text-yellow-700'>
            <Info className='h-3 w-3 mr-1' />
            Medium Risk
          </Badge>
        )
      case 'HIGH':
        return (
          <Badge variant='outline' className='bg-red-50 text-red-700'>
            <AlertCircle className='h-3 w-3 mr-1' />
            High Risk
          </Badge>
        )
      default:
        return (
          <Badge variant='outline'>
            <Info className='h-3 w-3 mr-1' />
            Unknown
          </Badge>
        )
    }
  }

  if (invoices.length === 0) {
    return (
      <div className='text-center py-10'>
        <h3 className='text-lg font-medium text-muted-foreground'>
          No investment opportunities available
        </h3>
        <p className='text-sm mt-2'>
          There are currently no tokenized invoices available for financing.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-medium'>
          Available Opportunities ({filteredInvoices.length})
        </h3>
        <Select
          value={riskFilter}
          onValueChange={(value) => setRiskFilter(value)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by risk' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All Risk Levels</SelectItem>
            <SelectItem value='LOW'>Low Risk Only</SelectItem>
            <SelectItem value='MEDIUM'>Medium Risk Only</SelectItem>
            <SelectItem value='HIGH'>High Risk Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => {
            // Calculate days until due
            const dueDate = new Date(invoice.dueDate)
            const today = new Date()
            const daysLeft = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <TableRow key={invoice.id}>
                <TableCell className='font-medium'>
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>
                  {invoice.supplier.companyName ||
                    invoice.supplier.name ||
                    'Unknown'}
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    typeof invoice.amount === 'object'
                      ? Number(invoice.amount.toString())
                      : Number(invoice.amount),
                    invoice.currency
                  )}
                </TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>{getRiskBadge(invoice.riskCategory)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      daysLeft < 15
                        ? 'destructive'
                        : daysLeft < 30
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {daysLeft} days
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    size='sm'
                    onClick={() => handleInvestClick(invoice)}
                    disabled={financeInvoiceMutation.isLoading}
                  >
                    Invest
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Investment Dialog */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Finance Invoice</DialogTitle>
            <DialogDescription>
              {selectedInvoice && <>Invoice #{selectedInvoice.invoiceNumber}</>}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <input
                  type='hidden'
                  {...form.register('invoiceId')}
                  value={selectedInvoice.id}
                />

                <div className='grid gap-4 py-2'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='text-sm font-medium'>Total Amount</div>
                    <div>
                      {formatCurrency(
                        typeof selectedInvoice.amount === 'object'
                          ? Number(selectedInvoice.amount.toString())
                          : Number(selectedInvoice.amount),
                        selectedInvoice.currency
                      )}
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='text-sm font-medium'>Supplier</div>
                    <div>
                      {selectedInvoice.supplier.companyName ||
                        selectedInvoice.supplier.name}
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='text-sm font-medium'>Due Date</div>
                    <div>{formatDate(selectedInvoice.dueDate)}</div>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='text-sm font-medium'>Risk Category</div>
                    <div>{getRiskBadge(selectedInvoice.riskCategory)}</div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Amount*</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Enter amount'
                          {...field}
                          step='0.01'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='interestRate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Interest Rate (%)*</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Enter interest rate'
                          {...field}
                          step='0.1'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className='mt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setSelectedInvoice(null)}
                    disabled={financeInvoiceMutation.isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={financeInvoiceMutation.isLoading}
                  >
                    {financeInvoiceMutation.isLoading
                      ? 'Processing...'
                      : 'Finance Invoice'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
