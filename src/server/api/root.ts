import { createTRPCRouter } from '@/server/api/trpc'
import { userRouter } from '@/server/api/routers/user'
import { invoiceRouter } from '@/server/api/routers/invoice'
import { financingRouter } from '@/server/api/routers/financing'
import { kycRouter } from '@/server/api/routers/kyc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  invoice: invoiceRouter,
  financing: financingRouter,
  kyc: kycRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
