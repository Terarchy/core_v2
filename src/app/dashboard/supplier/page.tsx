'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRightIcon,
  PlusIcon,
  DollarSignIcon,
  ClipboardCheckIcon,
  ClockIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { api } from '@/lib/api/trpc'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Import components that we'll implement later
import InvoicesList from '@/components/dashboard/supplier/InvoicesList'
import CreateInvoiceForm from '@/components/dashboard/supplier/CreateInvoiceForm'
import KycStatusCard from '@/components/dashboard/KycStatusCard'
import AccountSettings from '@/components/dashboard/AccountSettings'

export default function SupplierDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('invoices')
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)

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

  // Get supplier's invoices
  const { data: invoicesData, isLoading: isLoadingInvoices } =
    api.invoice.getMyInvoices.useQuery(
      { status: 'ALL' },
      { enabled: status === 'authenticated' }
    )

  // Get supplier's KYC status
  const { data: kycData, isLoading: isLoadingKyc } =
    api.kyc.getMyKycStatus.useQuery(undefined, {
      enabled: status === 'authenticated',
    })

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

  // Calculate dashboard stats
  const draftInvoices =
    invoicesData?.invoices.filter((invoice) => invoice.status === 'DRAFT') || []
  const pendingInvoices =
    invoicesData?.invoices.filter(
      (invoice) => invoice.status === 'PENDING_APPROVAL'
    ) || []
  // const verifiedInvoices =
  //   invoicesData?.invoices.filter((invoice) => invoice.status === 'VERIFIED') ||
  //   []
  const tokenizedInvoices =
    invoicesData?.invoices.filter(
      (invoice) => invoice.status === 'TOKENIZED'
    ) || []
  const financedInvoices =
    invoicesData?.invoices.filter(
      (invoice) =>
        invoice.status === 'PARTIALLY_FINANCED' ||
        invoice.status === 'FULLY_FINANCED'
    ) || []

  return (
    <div className='container p-4 md:p-6 mx-auto max-w-7xl'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Supplier Dashboard</h1>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              setActiveTab('invoices')
              setIsCreatingInvoice(true)
            }}
            className='px-2 py-2 md:px-6 md:py-2'
          >
            <PlusIcon className='h-4 w-4 md:mr-2' />
            <span className='hidden md:inline'>Create Invoice</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Draft Invoices
                </p>
                <p className='text-2xl font-bold'>{draftInvoices.length}</p>
              </div>
              <div className='p-2 bg-blue-100 rounded-full'>
                <ClipboardCheckIcon className='h-5 w-5 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Pending Approval
                </p>
                <p className='text-2xl font-bold'>{pendingInvoices.length}</p>
              </div>
              <div className='p-2 bg-yellow-100 rounded-full'>
                <ClockIcon className='h-5 w-5 text-yellow-600' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Tokenized
                </p>
                <p className='text-2xl font-bold'>{tokenizedInvoices.length}</p>
              </div>
              <div className='p-2 bg-green-100 rounded-full'>
                <ShieldCheckIcon className='h-5 w-5 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Financed
                </p>
                <p className='text-2xl font-bold'>{financedInvoices.length}</p>
              </div>
              <div className='p-2 bg-purple-100 rounded-full'>
                <DollarSignIcon className='h-5 w-5 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='mb-8 p-1'>
          <TabsTrigger value='invoices' className='px-6 py-2'>
            Invoice Management
          </TabsTrigger>
          <TabsTrigger value='financing' className='px-6 py-2'>
            Financing
          </TabsTrigger>
          <TabsTrigger value='kyc' className='px-6 py-2'>
            KYC Status
          </TabsTrigger>
          <TabsTrigger value='account' className='px-6 py-2'>
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value='invoices' className='space-y-8'>
          {isCreatingInvoice ? (
            <Card>
              <CardHeader className='pb-6'>
                <CardTitle>Create New Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateInvoiceForm
                  onSuccess={() => setIsCreatingInvoice(false)}
                  onCancel={() => setIsCreatingInvoice(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className='pb-6'>
                <CardTitle>Your Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingInvoices ? (
                  <div className='flex justify-center py-12'>
                    <div className='animate-pulse flex space-x-2'>
                      <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                      <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                      <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    </div>
                  </div>
                ) : (
                  <InvoicesList
                    invoices={(invoicesData?.invoices || []).map((invoice) => ({
                      ...invoice,
                      amount: Number(invoice.amount),
                      issueDate: new Date(invoice.issueDate),
                      dueDate: new Date(invoice.dueDate),
                      description: invoice.description || undefined,
                      buyer: {
                        ...invoice.buyer,
                        name: invoice.buyer.name || undefined,
                        companyName: invoice.buyer.companyName || undefined,
                      },
                    }))}
                    onCreateNew={() => setIsCreatingInvoice(true)}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='financing' className='space-y-8'>
          <Card>
            <CardHeader className='pb-6'>
              <CardTitle>Invoice Financing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <p className='text-muted-foreground'>
                  Track the financing status of your invoices and payments from
                  financiers.
                </p>

                {financedInvoices.length > 0 ? (
                  <div className='border rounded-md p-6'>
                    <h3 className='font-medium mb-4'>Financed Invoices</h3>
                    <p className='text-sm text-muted-foreground mb-4'>
                      You have {financedInvoices.length} invoices that have
                      received financing.
                    </p>
                    <Button variant='link' className='p-0 h-auto' asChild>
                      <Link href='#financed-invoices'>
                        View details{' '}
                        <ArrowUpRightIcon className='ml-1 h-3 w-3' />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className='border rounded-md p-6 text-center'>
                    <p className='text-muted-foreground mb-4'>
                      No financed invoices yet
                    </p>
                    <p className='text-sm'>
                      Tokenize your verified invoices to make them available for
                      financing.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='kyc' className='space-y-8'>
          <Card>
            <CardHeader className='pb-6'>
              <CardTitle>KYC Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingKyc ? (
                <div className='flex justify-center py-12'>
                  <div className='animate-pulse flex space-x-2'>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                  </div>
                </div>
              ) : (
                <KycStatusCard
                  kycStatus={kycData?.kycStatus || 'PENDING'}
                  kycDetails={kycData?.kycDetails}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='account' className='space-y-8'>
          <Card>
            <CardHeader className='pb-6'>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountSettings user={session?.user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
