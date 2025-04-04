'use client'

import Link from 'next/link'
// import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api/trpc'
import { formatCurrency } from '@/lib/utils'

/**
 * Buyer Dashboard
 * 
 * This is the main dashboard for buyers. It displays the total number of invoices, pending invoices, and the total amount of invoices.
 * It also displays the recent invoices.
 * 
 */
export default function BuyerDashboard() {
  // const router = useRouter()
  // const [isLoading, setIsLoading] = useState(false)

  // Fetch buyer-specific data
  const { data: stats } = api.buyer.getStats.useQuery()
  const { data: recentInvoices, isLoading: isLoadingInvoices } =
    api.buyer.getRecentInvoices.useQuery()

  // const handleLogout = async () => {
  //   setIsLoading(true)
  //   try {
  //     await api.auth.logout.useMutation().mutateAsync()
  //     router.push('/auth/signin')
  //   } catch (error) {
  //     console.error('Logout error:', error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <h1 className='text-3xl font-bold'>Buyer Dashboard</h1>
            </div>
            <div className='flex items-center space-x-4'>
              {/* <Button
                variant='outline'
                size='sm'
                onClick={handleLogout}
                disabled={isLoading}
              >
                Logout
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Total Invoices Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.totalInvoices || 0}
              </div>
            </CardContent>
          </Card>

          {/* Pending Invoices Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.pendingInvoices || 0}
              </div>
            </CardContent>
          </Card>

          {/* Total Amount Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(stats?.totalAmount || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <div className='mt-8'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Recent Invoices</h2>
            <Link href='/dashboard/buyer/invoices'>
              <Button variant='outline' size='sm'>
                View All
              </Button>
            </Link>
          </div>
          <div className='mt-4'>
            <Card>
              <CardContent className='p-6'>
                {isLoadingInvoices ? (
                  <div className='flex justify-center items-center h-40'>
                    <div className='animate-pulse text-gray-400'>
                      Loading invoices...
                    </div>
                  </div>
                ) : recentInvoices?.length === 0 ? (
                  <div className='flex justify-center items-center h-40'>
                    <div className='text-gray-400'>No invoices found</div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {recentInvoices?.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/dashboard/buyer/invoices/${invoice.id}`}
                        className='block hover:bg-gray-50 rounded-lg transition-colors'
                      >
                        <div className='flex items-center justify-between py-2 px-4 border-b last:border-0'>
                          <div>
                            <div className='font-medium'>
                              {invoice.invoiceNumber}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {invoice.supplier.companyName ||
                                invoice.supplier.name}
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='font-medium'>
                              {formatCurrency(invoice.amount)}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
