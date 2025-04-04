'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/formatters'

// Define analytics types
type FinancingAnalytics = {
  totalInvested: number | string | { toString: () => string }
  outstanding: number | string | { toString: () => string }
  repaid: number | string | { toString: () => string }
  defaulted: number | string | { toString: () => string }
  statusCounts: Record<string, number>
  riskDistribution: Array<{
    riskCategory: string | null
    count: number | bigint
    total: number | string | { toString: () => string }
  }>
}

type PortfolioAnalyticsProps = {
  analytics?: FinancingAnalytics
}

export default function PortfolioAnalytics({
  analytics,
}: PortfolioAnalyticsProps) {
  if (!analytics) {
    return (
      <div className='text-center py-10'>
        <h3 className='text-lg font-medium text-muted-foreground'>
          No analytics data available
        </h3>
        <p className='text-sm mt-2'>
          Start investing to see portfolio analytics.
        </p>
      </div>
    )
  }

  const totalInvested =
    typeof analytics.totalInvested === 'object'
      ? Number(analytics.totalInvested.toString())
      : Number(analytics.totalInvested)

  const outstanding =
    typeof analytics.outstanding === 'object'
      ? Number(analytics.outstanding.toString())
      : Number(analytics.outstanding)

  const repaid =
    typeof analytics.repaid === 'object'
      ? Number(analytics.repaid.toString())
      : Number(analytics.repaid)

  const defaulted =
    typeof analytics.defaulted === 'object'
      ? Number(analytics.defaulted.toString())
      : Number(analytics.defaulted)

  // Calculate ROI
  const roi =
    totalInvested > 0 ? ((repaid - totalInvested) / totalInvested) * 100 : 0

  // Calculate portfolio status distribution for visualization
  const statusData = [
    { status: 'Outstanding', value: outstanding, color: 'bg-blue-500' },
    { status: 'Repaid', value: repaid, color: 'bg-green-500' },
    { status: 'Defaulted', value: defaulted, color: 'bg-red-500' },
  ]

  const totalAmount = statusData.reduce((sum, item) => sum + item.value, 0)

  // Process risk distribution data
  const riskData = analytics.riskDistribution.map((item) => ({
    category: item.riskCategory || 'UNKNOWN',
    count: Number(item.count),
    total:
      typeof item.total === 'object'
        ? Number(item.total.toString())
        : Number(item.total),
  }))

  const totalRiskAmount = riskData.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className='space-y-6'>
      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalInvested)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div className='text-2xl font-bold'>
              {formatCurrency(outstanding)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Repaid
            </CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div className='text-2xl font-bold'>{formatCurrency(repaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div
              className={`text-2xl font-bold ${
                roi >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {roi.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Status Distribution</CardTitle>
          <CardDescription>
            Breakdown of your investments by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Visual distribution bar */}
            <div className='w-full h-8 flex rounded-md overflow-hidden'>
              {statusData.map((item, index) => (
                <div
                  key={index}
                  className={`${item.color} h-full`}
                  style={{
                    width: `${
                      totalAmount > 0 ? (item.value / totalAmount) * 100 : 0
                    }%`,
                    minWidth: item.value > 0 ? '1%' : '0',
                  }}
                ></div>
              ))}
            </div>

            {/* Legend */}
            <div className='flex flex-wrap gap-4'>
              {statusData.map((item, index) => (
                <div key={index} className='flex items-center'>
                  <div
                    className={`w-3 h-3 ${item.color} rounded-full mr-2`}
                  ></div>
                  <span className='text-sm'>{item.status}:</span>
                  <span className='text-sm font-medium ml-1'>
                    {formatCurrency(item.value)}(
                    {totalAmount > 0
                      ? ((item.value / totalAmount) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Exposure</CardTitle>
          <CardDescription>
            Distribution of outstanding investments by risk category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Risk exposure table */}
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left py-2 font-medium'>Risk Category</th>
                  <th className='text-right py-2 font-medium'>Count</th>
                  <th className='text-right py-2 font-medium'>Amount</th>
                  <th className='text-right py-2 font-medium'>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {riskData.map((item, index) => (
                  <tr key={index} className='border-b'>
                    <td className='py-2'>
                      <div className='flex items-center'>
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            item.category === 'LOW'
                              ? 'bg-green-500'
                              : item.category === 'MEDIUM'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        ></div>
                        {item.category}
                      </div>
                    </td>
                    <td className='text-right py-2'>{item.count}</td>
                    <td className='text-right py-2'>
                      {formatCurrency(item.total)}
                    </td>
                    <td className='text-right py-2'>
                      {totalRiskAmount > 0
                        ? ((item.total / totalRiskAmount) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
                <tr className='font-medium'>
                  <td className='py-2'>Total</td>
                  <td className='text-right py-2'>
                    {riskData.reduce((sum, item) => sum + item.count, 0)}
                  </td>
                  <td className='text-right py-2'>
                    {formatCurrency(totalRiskAmount)}
                  </td>
                  <td className='text-right py-2'>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Activity</CardTitle>
          <CardDescription>Summary of investment statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 rounded-lg border bg-card text-center'>
              <div className='text-3xl font-bold text-blue-600 mb-1'>
                {analytics.statusCounts.ACTIVE || 0}
              </div>
              <div className='text-sm text-muted-foreground'>
                Active Investments
              </div>
            </div>

            <div className='p-4 rounded-lg border bg-card text-center'>
              <div className='text-3xl font-bold text-green-600 mb-1'>
                {analytics.statusCounts.REPAID || 0}
              </div>
              <div className='text-sm text-muted-foreground'>
                Repaid Investments
              </div>
            </div>

            <div className='p-4 rounded-lg border bg-card text-center'>
              <div className='text-3xl font-bold text-red-600 mb-1'>
                {analytics.statusCounts.DEFAULTED || 0}
              </div>
              <div className='text-sm text-muted-foreground'>
                Defaulted Investments
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
