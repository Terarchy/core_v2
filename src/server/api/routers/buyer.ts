import { createTRPCRouter, buyerProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const buyerRouter = createTRPCRouter({
  getStats: buyerProcedure.query(async ({ ctx }) => {
    const [totalInvoices, pendingInvoices, totalAmount] = await Promise.all([
      ctx.db.invoice.count({
        where: {
          buyerId: ctx.session.user.id,
        },
      }),
      ctx.db.invoice.count({
        where: {
          buyerId: ctx.session.user.id,
          status: 'PENDING_APPROVAL',
        },
      }),
      ctx.db.invoice.aggregate({
        where: {
          buyerId: ctx.session.user.id,
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    return {
      totalInvoices,
      pendingInvoices,
      totalAmount: totalAmount._sum.amount || 0,
    }
  }),

  getRecentInvoices: buyerProcedure.query(async ({ ctx }) => {
    const invoices = await ctx.db.invoice.findMany({
      where: {
        buyerId: ctx.session.user.id,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        supplier: {
          select: {
            name: true,
            companyName: true,
          },
        },
      },
    })

    return invoices
  }),

  getInvoice: buyerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: {
          id: input.id,
          buyerId: ctx.session.user.id,
        },
        include: {
          supplier: {
            select: {
              name: true,
              email: true,
              companyName: true,
            },
          },
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      return invoice
    }),

  approveInvoice: buyerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: {
          id: input.id,
          buyerId: ctx.session.user.id,
          status: 'PENDING_APPROVAL',
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found or not pending approval',
        })
      }

      return ctx.db.invoice.update({
        where: { id: input.id },
        data: { status: 'VERIFIED' },
      })
    }),

  rejectInvoice: buyerProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().min(1, 'Rejection reason is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: {
          id: input.id,
          buyerId: ctx.session.user.id,
          status: 'PENDING_APPROVAL',
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found or not pending approval',
        })
      }

      return ctx.db.invoice.update({
        where: { id: input.id },
        data: {
          status: 'REJECTED',
          rejectionReason: input.reason,
        },
      })
    }),
})
