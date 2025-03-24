'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { api } from '@/lib/api/trpc'
import { toast } from 'sonner'

// Form schema
const formSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  currency: z.string().min(1, 'Currency is required'),
  issueDate: z.date(),
  dueDate: z.date(),
  description: z.string().optional(),
  buyerId: z.string().min(1, 'Buyer is required'),
})

type FormValues = z.infer<typeof formSchema>

type CreateInvoiceFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateInvoiceForm({
  onSuccess,
  onCancel,
}: CreateInvoiceFormProps) {
  const utils = api.useUtils()

  // Get all buyers for dropdown
  const { data: buyersData, isLoading: isLoadingBuyers } =
    api.user.getBuyers.useQuery({
      limit: 100, // Get a reasonable number of buyers
    })

  // Default form values
  const defaultValues: FormValues = {
    invoiceNumber: '',
    amount: 0,
    quantity: 1,
    currency: 'NGN',
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default due date: 30 days
    description: '',
    buyerId: '',
  }

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Calculate total amount when amount or quantity changes
  const amount = form.watch('amount')
  const quantity = form.watch('quantity')
  const totalAmount = amount * quantity

  // Create invoice mutation
  const createInvoiceMutation = api.invoice.createInvoice.useMutation({
    onSuccess: () => {
      toast.success('Invoice Created', {
        description: 'Your invoice has been created successfully.',
      })
      void utils.invoice.getMyInvoices.invalidate()
      onSuccess()
    },
    onError: (error) => {
      toast.error('Error', {
        description: error.message,
      })
    },
  })

  // Form submission
  const onSubmit = (values: FormValues) => {
    createInvoiceMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='invoiceNumber'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Invoice Number*</FormLabel>
                <FormControl>
                  <Input placeholder='INV-0001' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='buyerId'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Buyer*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingBuyers}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a buyer' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buyersData?.buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.companyName || buyer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Unit Price*</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='1000.00'
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === '' ? 0 : parseFloat(value))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='quantity'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Quantity*</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='1'
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === '' ? 1 : parseInt(value))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='currency'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Currency*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select currency' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='NGN'>NGN</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='EUR'>EUR</SelectItem>
                    <SelectItem value='GBP'>GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='mt-4 p-4 bg-gray-50 rounded-md'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-gray-700'>
              Total Amount:
            </span>
            <span className='text-lg font-semibold'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: form.getValues('currency'),
              }).format(totalAmount)}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='issueDate'
            render={({ field }) => (
              <FormItem className='flex flex-col w-full'>
                <FormLabel>Issue Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className='w-full pl-3 text-left font-normal'
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dueDate'
            render={({ field }) => (
              <FormItem className='flex flex-col w-full'>
                <FormLabel>Due Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className='w-full pl-3 text-left font-normal'
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < form.getValues().issueDate
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Optional description of the invoice'
                  className='min-h-[100px]'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end space-x-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={createInvoiceMutation.isLoading}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={createInvoiceMutation.isLoading}>
            {createInvoiceMutation.isLoading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
