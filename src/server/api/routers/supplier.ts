import { createTRPCRouter, supplierProcedure } from '../trpc'

export const supplierRouter = createTRPCRouter({
  getStats: supplierProcedure.query(async () => {
    return {
      totalInvoices: 0,
      pendingInvoices: 0,
      totalAmount: 0,
    }
  }),
})
