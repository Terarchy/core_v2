import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc'

type KycStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'

export const kycRouter = createTRPCRouter({
  // Submit KYC/KYB documents
  submitKycDocuments: protectedProcedure
    .input(
      z.object({
        // For individuals (KYC)
        identificationDocUrl: z.string().url().optional(),
        addressProofUrl: z.string().url().optional(),

        // For businesses (KYB)
        businessRegDocUrl: z.string().url().optional(),
        taxRegistrationUrl: z.string().url().optional(),
        financialStatementsUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Check if user already has KYC details
      const existingKycDetails = await ctx.db.kycDetails.findUnique({
        where: { userId },
      })

      // Update user's KYC status to IN_PROGRESS
      await ctx.db.user.update({
        where: { id: userId },
        data: { kycStatus: 'IN_PROGRESS' },
      })

      if (existingKycDetails) {
        // Update existing KYC details
        return ctx.db.kycDetails.update({
          where: { userId },
          data: {
            ...input,
            updatedAt: new Date(),
          },
        })
      } else {
        // Create new KYC details
        return ctx.db.kycDetails.create({
          data: {
            userId,
            ...input,
          },
        })
      }
    }),

  // Get KYC status and details for current user
  getMyKycStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        kycStatus: true,
        kycDetails: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    return user
  }),

  // Admin: Get KYC submissions that need review
  getPendingKycSubmissions: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        status: z
          .enum(['IN_PROGRESS', 'PENDING', 'ALL'])
          .default('IN_PROGRESS'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, status } = input

      const where: Record<string, unknown> = {}
      if (status !== 'ALL') {
        where.kycStatus = status
      }

      const users = await ctx.db.user.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: {
          kycDetails: true,
        },
      })

      let nextCursor: typeof cursor = undefined
      if (users.length > limit) {
        const nextItem = users.pop()
        nextCursor = nextItem?.id
      }

      return {
        users,
        nextCursor,
      }
    }),

  // Admin: Approve or reject KYC submission
  updateKycStatus: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum(['APPROVED', 'REJECTED']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, status, notes } = input

      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: {
          kycDetails: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      if (!user.kycDetails) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User has not submitted KYC details',
        })
      }

      // Update KYC details with notes if provided
      if (notes) {
        await ctx.db.kycDetails.update({
          where: { userId },
          data: { notes },
        })
      }

      // Update user's KYC status
      return ctx.db.user.update({
        where: { id: userId },
        data: { kycStatus: status as KycStatus },
      })
    }),

  // Mock AML check
  performAmlCheck: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input

      // Check if user exists with KYC details
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: {
          kycDetails: true,
        },
      })

      if (!user || !user.kycDetails) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User or KYC details not found',
        })
      }

      // In a real implementation, this would call an external AML service
      // For now, we'll simulate a successful AML check
      const amlStatus = Math.random() > 0.1 ? 'PASSED' : 'FAILED'

      // Update KYC details with AML check results
      await ctx.db.kycDetails.update({
        where: { userId },
        data: {
          amlCheckCompleted: true,
          amlCheckDate: new Date(),
          amlCheckStatus: amlStatus,
        },
      })

      // If AML failed, update user KYC status to rejected
      if (amlStatus === 'FAILED') {
        await ctx.db.user.update({
          where: { id: userId },
          data: { kycStatus: 'REJECTED' },
        })
      }

      return { amlStatus }
    }),
})
