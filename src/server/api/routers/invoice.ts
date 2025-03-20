import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  createTRPCRouter,
  protectedProcedure,
  supplierProcedure,
  buyerProcedure,
  financierProcedure,
} from '@/server/api/trpc'
import { InvoiceStatus, RiskCategory } from '@prisma/client'

export const invoiceRouter = createTRPCRouter({
  // Create a new invoice (supplier only)
  createInvoice: supplierProcedure
    .input(
      z.object({
        invoiceNumber: z.string(),
        amount: z.number().positive(),
        currency: z.string(),
        issueDate: z.date(),
        dueDate: z.date(),
        description: z.string().optional(),
        buyerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if invoice number already exists
      const existingInvoice = await ctx.db.invoice.findUnique({
        where: { invoiceNumber: input.invoiceNumber },
      })

      if (existingInvoice) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Invoice with this number already exists',
        })
      }

      // Check if buyer exists
      const buyer = await ctx.db.user.findUnique({
        where: { id: input.buyerId, role: 'BUYER' },
      })

      if (!buyer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Buyer not found',
        })
      }

      // Calculate risk score and category (simplified for now)
      const daysUntilDue = Math.ceil(
        (input.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      let riskScore = 50 // Base score
      let riskCategory: RiskCategory = 'MEDIUM'

      // Adjust risk based on time to due date
      if (daysUntilDue > 90) {
        riskScore -= 20
      } else if (daysUntilDue < 30) {
        riskScore += 20
      }

      // Adjust risk based on amount
      if (input.amount > 100000) {
        riskScore += 15
      } else if (input.amount < 10000) {
        riskScore -= 10
      }

      // Determine risk category
      if (riskScore < 40) {
        riskCategory = 'LOW'
      } else if (riskScore > 60) {
        riskCategory = 'HIGH'
      }

      return ctx.db.invoice.create({
        data: {
          invoiceNumber: input.invoiceNumber,
          amount: input.amount,
          currency: input.currency,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          description: input.description,
          status: 'DRAFT',
          riskScore: riskScore,
          riskCategory: riskCategory,
          supplierId: ctx.session.user.id,
          buyerId: input.buyerId,
        },
      })
    }),

  // Submit invoice for approval (supplier only)
  submitInvoice: supplierProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      if (invoice.supplierId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to submit this invoice',
        })
      }

      if (invoice.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot submit invoice in ${invoice.status} status`,
        })
      }

      return ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: { status: 'PENDING_APPROVAL' },
      })
    }),

  // Approve invoice (buyer only)
  approveInvoice: buyerProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      if (invoice.buyerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to approve this invoice',
        })
      }

      if (invoice.status !== 'PENDING_APPROVAL') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot approve invoice in ${invoice.status} status`,
        })
      }

      return ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: { status: 'VERIFIED' },
      })
    }),

  // Reject invoice (buyer only)
  rejectInvoice: buyerProcedure
    .input(z.object({ invoiceId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      if (invoice.buyerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to reject this invoice',
        })
      }

      if (invoice.status !== 'PENDING_APPROVAL') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot reject invoice in ${invoice.status} status`,
        })
      }

      return ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: {
          status: 'REJECTED',
          description: input.reason
            ? `${invoice.description || ''} [REJECTED: ${input.reason}]`
            : invoice.description,
        },
      })
    }),

  // Tokenize invoice (supplier only)
  tokenizeInvoice: supplierProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      if (invoice.supplierId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to tokenize this invoice',
        })
      }

      if (invoice.status !== 'VERIFIED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot tokenize invoice in ${invoice.status} status`,
        })
      }

      // In the future, this would interact with a blockchain
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 40)

      return ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: {
          status: 'TOKENIZED',
          tokenizedAt: new Date(),
          tokenizationTxHash: mockTxHash,
        },
      })
    }),

  // Get invoice by ID
  getInvoiceById: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
            },
          },
          financing: {
            include: {
              financier: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                },
              },
            },
          },
          payments: true,
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      // Check permissions based on user role
      const userId = ctx.session.user.id
      const userRole = ctx.session.user.role

      if (
        userRole !== 'ADMIN' &&
        invoice.supplierId !== userId &&
        invoice.buyerId !== userId &&
        !invoice.financing.some((f) => f.financierId === userId)
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this invoice',
        })
      }

      return invoice
    }),

  // Get invoices for current user (role-specific)
  getMyInvoices: protectedProcedure
    .input(
      z.object({
        status: z
          .enum([
            'ALL',
            'DRAFT',
            'PENDING_APPROVAL',
            'REJECTED',
            'VERIFIED',
            'TOKENIZED',
            'PARTIALLY_FINANCED',
            'FULLY_FINANCED',
            'PARTIALLY_PAID',
            'PAID',
            'OVERDUE',
          ])
          .default('ALL'),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, limit, cursor } = input
      const userId = ctx.session.user.id
      const userRole = ctx.session.user.role

      // Build the where clause based on user role
      const where: Record<string, unknown> = {}

      if (status !== 'ALL') {
        where.status = status
      }

      if (userRole === 'SUPPLIER') {
        where.supplierId = userId
      } else if (userRole === 'BUYER') {
        where.buyerId = userId
      } else if (userRole === 'FINANCIER') {
        // For financiers, only show tokenized or financed invoices
        where.OR = [
          { status: 'TOKENIZED' },
          { status: 'PARTIALLY_FINANCED' },
          { status: 'FULLY_FINANCED' },
          { status: 'PARTIALLY_PAID' },
          { status: 'PAID' },
          { financing: { some: { financierId: userId } } },
        ]
      }

      const invoices = await ctx.db.invoice.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
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
          financing: {
            select: {
              id: true,
              amount: true,
              financierId: true,
              status: true,
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor = undefined
      if (invoices.length > limit) {
        const nextItem = invoices.pop()
        nextCursor = nextItem?.id
      }

      return {
        invoices,
        nextCursor,
      }
    }),

  // Get all tokenized invoices for financiers
  getTokenizedInvoices: financierProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        riskCategory: z.enum(['ALL', 'LOW', 'MEDIUM', 'HIGH']).default('ALL'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, riskCategory } = input

      const where: Record<string, unknown> = {
        status: 'TOKENIZED',
      }

      if (riskCategory !== 'ALL') {
        where.riskCategory = riskCategory
      }

      const invoices = await ctx.db.invoice.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ riskScore: 'asc' }, { dueDate: 'asc' }],
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              kycStatus: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor = undefined
      if (invoices.length > limit) {
        const nextItem = invoices.pop()
        nextCursor = nextItem?.id
      }

      return {
        invoices,
        nextCursor,
      }
    }),

  // Mark invoice as paid (buyer only)
  markInvoiceAsPaid: buyerProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        paymentDetails: z.object({
          amount: z.number().positive(),
          transactionRef: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { invoiceId, paymentDetails } = input

      const invoice = await ctx.db.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          financing: true,
          payments: true,
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      if (invoice.buyerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to mark this invoice as paid',
        })
      }

      const totalPaidSoFar = invoice.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      )

      const totalAmountWithPayment = totalPaidSoFar + paymentDetails.amount
      const invoiceAmount = Number(invoice.amount)

      // Determine payment type based on financing status
      let paymentType = 'BUYER_TO_SUPPLIER'
      let financingId = null

      if (invoice.financing.length > 0) {
        // If there's financing, payment goes to financier
        paymentType = 'BUYER_TO_FINANCIER'
        financingId = invoice.financing[0].id
      }

      // Create payment record
      const payment = await ctx.db.payment.create({
        data: {
          amount: paymentDetails.amount,
          transactionRef: paymentDetails.transactionRef,
          invoiceId: invoiceId,
          financingId: financingId,
          payerId: ctx.session.user.id,
          paymentType: paymentType as
            | 'BUYER_TO_SUPPLIER'
            | 'BUYER_TO_FINANCIER',
        },
      })

      // Update invoice status based on payment amount
      let newStatus: InvoiceStatus = invoice.status

      if (totalAmountWithPayment >= invoiceAmount) {
        newStatus = 'PAID'
      } else if (totalAmountWithPayment > 0) {
        newStatus = 'PARTIALLY_PAID'
      }

      // Update the invoice status
      await ctx.db.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      })

      return { payment, newStatus }
    }),
})
