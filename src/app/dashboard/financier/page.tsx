'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  DollarSignIcon,
  BarChart4Icon,
  PieChartIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { api } from '@/lib/api/trpc'
import { useRouter } from 'next/navigation'

// Import or create financier components
import InvestmentOpportunitiesList from '../../../components/dashboard/financier/InvestmentOpportunitiesList'
import FinancedInvoicesList from '../../../components/dashboard/financier/FinancedInvoicesList'
import PortfolioAnalytics from '../../../components/dashboard/financier/PortfolioAnalytics'
import KycStatusCard from '@/components/dashboard/KycStatusCard'
import AccountSettings from '@/components/dashboard/AccountSettings'
import { formatCurrency } from '@/lib/utils/formatters'

export default function FinancierDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('opportunities')

  // Redirect if not a financier
  useEffect(() => {
    if (status === 'authenticated') {
      if (
        session?.user?.role !== 'FINANCIER' &&
        session?.user?.role !== 'ADMIN'
      ) {
        router.push('/dashboard')
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, session, router])

  // Get financing analytics
  const { data: analytics, isLoading: isLoadingAnalytics } =
    api.financing.getFinancingAnalytics.useQuery(undefined, {
      enabled: status === 'authenticated',
    })

  // Get tokenized invoices
  const { data: tokenizedInvoicesData, isLoading: isLoadingTokenizedInvoices } =
    api.invoice.getTokenizedInvoices.useQuery(
      { riskCategory: 'ALL' },
      { enabled: status === 'authenticated' }
    )

  // Get financier's invested invoices
  const { data: financedInvoicesData, isLoading: isLoadingFinancedInvoices } =
    api.financing.getFinancedInvoices.useQuery(
      { status: 'ALL' },
      { enabled: status === 'authenticated' }
    )

  // Get financier's KYC status
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
  const activeFinancings =
    financedInvoicesData?.financings.filter((f) => f.status === 'ACTIVE') || []

  return (
    <div className='container p-4 md:p-6 mx-auto max-w-7xl'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Financier Dashboard</h1>
      </div>

      {/* Dashboard Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Invested
                </p>
                <p className='text-2xl font-bold'>
                  {formatCurrency(Number(analytics?.totalInvested || 0))}
                </p>
              </div>
              <div className='p-2 bg-blue-100 rounded-full'>
                <DollarSignIcon className='h-5 w-5 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Outstanding
                </p>
                <p className='text-2xl font-bold'>
                  {formatCurrency(Number(analytics?.outstanding || 0))}
                </p>
              </div>
              <div className='p-2 bg-yellow-100 rounded-full'>
                <BarChart4Icon className='h-5 w-5 text-yellow-600' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Repaid
                </p>
                <p className='text-2xl font-bold'>
                  {formatCurrency(Number(analytics?.repaid || 0))}
                </p>
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
                  Active Investments
                </p>
                <p className='text-2xl font-bold'>{activeFinancings.length}</p>
              </div>
              <div className='p-2 bg-purple-100 rounded-full'>
                <PieChartIcon className='h-5 w-5 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='mb-8 p-1'>
          <TabsTrigger value='opportunities' className='px-6 py-2'>
            Investment Opportunities
          </TabsTrigger>
          <TabsTrigger value='portfolio' className='px-6 py-2'>
            My Portfolio
          </TabsTrigger>
          <TabsTrigger value='analytics' className='px-6 py-2'>
            Analytics
          </TabsTrigger>
          <TabsTrigger value='kyc' className='px-6 py-2'>
            KYC Status
          </TabsTrigger>
          <TabsTrigger value='account' className='px-6 py-2'>
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value='opportunities' className='space-y-8'>
          <Card>
            <CardHeader className='pb-6'>
              <CardTitle>Investment Opportunities</CardTitle>
              <CardDescription>
                Browse tokenized invoices available for financing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTokenizedInvoices ? (
                <div className='flex justify-center py-12'>
                  <div className='animate-pulse flex space-x-2'>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                  </div>
                </div>
              ) : (
                <InvestmentOpportunitiesList
                  invoices={(tokenizedInvoicesData?.invoices || []).map(
                    (invoice) => ({
                      ...invoice,
                      riskScore: invoice.riskScore
                        ? Number(invoice.riskScore)
                        : undefined,
                      riskCategory: invoice.riskCategory || undefined,
                      issueDate: new Date(invoice.issueDate),
                      dueDate: new Date(invoice.dueDate),
                      amount: Number(invoice.amount),
                    })
                  )}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='portfolio' className='space-y-8'>
          <Card>
            <CardHeader className='pb-6'>
              <CardTitle>My Investments</CardTitle>
              <CardDescription>
                Track the status of your financed invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFinancedInvoices ? (
                <div className='flex justify-center py-12'>
                  <div className='animate-pulse flex space-x-2'>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                  </div>
                </div>
              ) : (
                <FinancedInvoicesList
                  financings={financedInvoicesData?.financings || []}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-8'>
          <Card>
            <CardHeader className='pb-6'>
              <CardTitle>Portfolio Analytics</CardTitle>
              <CardDescription>
                Analysis of your investment portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className='flex justify-center py-12'>
                  <div className='animate-pulse flex space-x-2'>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                    <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                  </div>
                </div>
              ) : (
                <PortfolioAnalytics
                  analytics={
                    analytics
                      ? {
                          ...analytics,
                          riskDistribution: (
                            (analytics.riskDistribution as Array<{
                              riskCategory: string | null
                              count: number | bigint
                              total:
                                | number
                                | string
                                | { toString: () => string }
                            }>) || []
                          ).map((item) => ({
                            riskCategory: item.riskCategory,
                            count: Number(item.count),
                            total: item.total,
                          })),
                        }
                      : undefined
                  }
                />
              )}
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
