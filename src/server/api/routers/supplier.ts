import { createTRPCRouter, supplierProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { RiskCategory } from '@prisma/client'

export const supplierRouter = createTRPCRouter({
  getStats: supplierProcedure.query(async () => {
    return {
      totalInvoices: 0,
      pendingInvoices: 0,
      totalAmount: 0,
    }
  }),

  // Edit a rejected invoice and resubmit it
  editRejectedInvoice: supplierProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        invoiceNumber: z.string().min(1, 'Invoice number is required'),
        amount: z.number().min(0.01, 'Amount must be greater than 0'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        currency: z.string().min(1, 'Currency is required'),
        issueDate: z.date(),
        dueDate: z.date(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify that the invoice exists and belongs to this supplier
      const invoice = await ctx.db.invoice.findUnique({
        where: {
          id: input.invoiceId,
          supplierId: ctx.session.user.id,
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found or you do not have permission to edit it',
        })
      }

      // Verify that the invoice is in REJECTED status
      if (invoice.status !== 'REJECTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only rejected invoices can be edited',
        })
      }

      // Check if the invoice number already exists (excluding the current invoice)
      if (input.invoiceNumber !== invoice.invoiceNumber) {
        const existingInvoice = await ctx.db.invoice.findUnique({
          where: { invoiceNumber: input.invoiceNumber },
        })

        if (existingInvoice && existingInvoice.id !== input.invoiceId) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Invoice with this number already exists',
          })
        }
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
      const totalAmount = input.amount * input.quantity
      if (totalAmount > 100000) {
        riskScore += 15
      } else if (totalAmount < 10000) {
        riskScore -= 10
      }

      // Determine risk category
      if (riskScore < 40) {
        riskCategory = 'LOW'
      } else if (riskScore > 60) {
        riskCategory = 'HIGH'
      }

      // Update the invoice and set it back to PENDING_APPROVAL
      const updatedInvoice = await ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: {
          invoiceNumber: input.invoiceNumber,
          amount: input.amount * input.quantity, // Save the total amount
          currency: input.currency,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          description: input.description,
          status: 'PENDING_APPROVAL',
          riskScore: riskScore,
          riskCategory: riskCategory,
          updatedAt: new Date(),
          rejectionReason: null, // Clear the rejection reason
        },
      })

      return updatedInvoice
    }),

  // Get a rejected invoice for editing
  getRejectedInvoice: supplierProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: {
          id: input.invoiceId,
          supplierId: ctx.session.user.id,
          status: 'REJECTED',
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Rejected invoice not found',
        })
      }

      return invoice
    }),
})
