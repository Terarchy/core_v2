import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, financierProcedure } from '@/server/api/trpc'

export const financingRouter = createTRPCRouter({
  // Finance an invoice (financier only)
  financeInvoice: financierProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        amount: z.number().positive(),
        interestRate: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { invoiceId, amount, interestRate } = input

      // Get the invoice
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          financing: true,
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      if (
        invoice.status !== 'TOKENIZED' &&
        invoice.status !== 'PARTIALLY_FINANCED'
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot finance invoice in ${invoice.status} status`,
        })
      }

      // Check if financier has already financed this invoice
      const existingFinancing = invoice.financing.find(
        (f) => f.financierId === ctx.session.user.id
      )

      if (existingFinancing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already financed this invoice',
        })
      }

      // Calculate total financed amount including the new financing
      const totalFinancedSoFar = invoice.financing.reduce(
        (sum, financing) => sum + Number(financing.amount),
        0
      )

      const totalFinanced = totalFinancedSoFar + amount
      const invoiceAmount = Number(invoice.amount)

      if (totalFinanced > invoiceAmount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Financing amount exceeds invoice amount. Maximum available: ${
            invoiceAmount - totalFinancedSoFar
          }`,
        })
      }

      // Create the financing record
      const financing = await ctx.db.financing.create({
        data: {
          amount,
          interestRate,
          invoiceId,
          financierId: ctx.session.user.id,
        },
      })

      // Update invoice status
      const newStatus =
        totalFinanced === invoiceAmount
          ? 'FULLY_FINANCED'
          : 'PARTIALLY_FINANCED'

      await ctx.db.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      })

      // Create payment record from financier to supplier
      await ctx.db.payment.create({
        data: {
          amount,
          invoiceId,
          financingId: financing.id,
          payerId: ctx.session.user.id,
          paymentType: 'FINANCIER_TO_SUPPLIER',
        },
      })

      return {
        financing,
        invoiceStatus: newStatus,
      }
    }),

  // Get financed invoices (financier only)
  getFinancedInvoices: financierProcedure
    .input(
      z.object({
        status: z.enum(['ALL', 'ACTIVE', 'REPAID', 'DEFAULTED']).default('ALL'),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, limit, cursor } = input

      const where: Record<string, unknown> = {
        financierId: ctx.session.user.id,
      }

      if (status !== 'ALL') {
        where.status = status
      }

      const financings = await ctx.db.financing.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                },
              },
              buyer: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                },
              },
              payments: {
                where: {
                  paymentType: 'BUYER_TO_FINANCIER',
                },
              },
            },
          },
        },
      })

      let nextCursor: typeof cursor = undefined
      if (financings.length > limit) {
        const nextItem = financings.pop()
        nextCursor = nextItem?.id
      }

      return {
        financings,
        nextCursor,
      }
    }),

  // Get financing analytics and summary
  getFinancingAnalytics: financierProcedure.query(async ({ ctx }) => {
    const financierId = ctx.session.user.id

    // Total amount invested
    const totalInvestedResult = await ctx.db.financing.aggregate({
      where: { financierId },
      _sum: { amount: true },
    })

    // Total outstanding amount
    const outstandingResult = await ctx.db.financing.aggregate({
      where: {
        financierId,
        status: 'ACTIVE',
      },
      _sum: { amount: true },
    })

    // Total repaid amount
    const repaidResult = await ctx.db.financing.aggregate({
      where: {
        financierId,
        status: 'REPAID',
      },
      _sum: { amount: true },
    })

    // Total defaulted amount
    const defaultedResult = await ctx.db.financing.aggregate({
      where: {
        financierId,
        status: 'DEFAULTED',
      },
      _sum: { amount: true },
    })

    // Count of financings by status
    const statusCounts = await ctx.db.financing.groupBy({
      by: ['status'],
      where: { financierId },
      _count: true,
    })

    // Active financings by risk category
    const riskDistribution = await ctx.db.$queryRaw`
      SELECT i."riskCategory", COUNT(*) as count, SUM(f.amount) as total
      FROM "Financing" f
      JOIN "Invoice" i ON f."invoiceId" = i.id
      WHERE f."financierId" = ${financierId}
      AND f.status = 'ACTIVE'
      GROUP BY i."riskCategory"
    `

    return {
      totalInvested: totalInvestedResult._sum.amount || 0,
      outstanding: outstandingResult._sum.amount || 0,
      repaid: repaidResult._sum.amount || 0,
      defaulted: defaultedResult._sum.amount || 0,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
      riskDistribution,
    }
  }),
})
