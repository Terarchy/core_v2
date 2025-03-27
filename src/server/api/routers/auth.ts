import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { compare } from 'bcryptjs'

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const isValid = await compare(input.password, user.password)

      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        })
      }

      // Set session
      ctx.session = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      }

      return user
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session = null
    return { success: true }
  }),
})
