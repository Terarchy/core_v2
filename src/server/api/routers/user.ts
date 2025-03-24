import { z } from 'zod'
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc'
import bcrypt from 'bcrypt'
import { TRPCError } from '@trpc/server'
import { UserRole } from '@prisma/client'

export const userRouter = createTRPCRouter({
  // Register new user
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['SUPPLIER', 'BUYER', 'FINANCIER']),
        companyName: z.string().optional(),
        companyRegistrationNo: z.string().optional(),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)
      return ctx.db.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: input.role as UserRole,
          companyName: input.companyName,
          companyRegistrationNo: input.companyRegistrationNo,
          phoneNumber: input.phoneNumber,
          address: input.address,
          country: input.country,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          kycStatus: true,
          createdAt: true,
        },
      })
    }),

  // Get user settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        phoneNumber: true,
        country: true,
        notificationsEnabled: true,
        twoFactorEnabled: true,
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

  // Update user settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        companyName: z.string().min(1).optional(),
        phoneNumber: z.string().min(1).optional(),
        country: z.string().min(1).optional(),
        notificationsEnabled: z.boolean().optional(),
        twoFactorEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phoneNumber: true,
          country: true,
          notificationsEnabled: true,
          twoFactorEnabled: true,
        },
      })

      return user
    }),

  // Get all buyers (admin and supplier only)
  getBuyers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin or supplier
      if (
        ctx.session.user.role !== 'ADMIN' &&
        ctx.session.user.role !== 'SUPPLIER'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins and suppliers can view buyers',
        })
      }

      const { limit, cursor } = input

      const buyers = await ctx.db.user.findMany({
        take: limit + 1,
        where: {
          role: 'BUYER',
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phoneNumber: true,
          country: true,
          createdAt: true,
        },
      })

      let nextCursor: typeof cursor = undefined
      if (buyers.length > limit) {
        const nextItem = buyers.pop()
        nextCursor = nextItem?.id
      }

      return {
        buyers,
        nextCursor,
      }
    }),

  // Admin: Get all users
  getAllUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        role: z.enum(['ADMIN', 'SUPPLIER', 'BUYER', 'FINANCIER']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, role } = input

      const users = await ctx.db.user.findMany({
        take: limit + 1,
        where: role ? { role } : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          phoneNumber: true,
          country: true,
          createdAt: true,
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

  // Admin: Update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['ADMIN', 'SUPPLIER', 'BUYER', 'FINANCIER']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          phoneNumber: true,
          country: true,
          createdAt: true,
        },
      })

      return user
    }),

  // Admin: Delete user
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.delete({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          phoneNumber: true,
          country: true,
          createdAt: true,
        },
      })

      return user
    }),
})
