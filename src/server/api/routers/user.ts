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
  // Create a new user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        role: z.enum(['SUPPLIER', 'BUYER', 'FINANCIER']),
        companyName: z.string().optional(),
        companyRegistrationNo: z.string().optional(),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  // Get the current user's profile
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        companyRegistrationNo: true,
        phoneNumber: true,
        address: true,
        country: true,
        kycStatus: true,
        emailVerified: true,
        createdAt: true,
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

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        companyName: z.string().optional(),
        companyRegistrationNo: z.string().optional(),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...input,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          companyRegistrationNo: true,
          phoneNumber: true,
          address: true,
          country: true,
        },
      })
    }),

  // Admin: Get all users (with pagination)
  getAllUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        role: z.enum(['SUPPLIER', 'BUYER', 'FINANCIER', 'ADMIN']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, role } = input

      const users = await ctx.db.user.findMany({
        take: limit + 1,
        where: role ? { role: role as UserRole } : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          kycStatus: true,
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
})
