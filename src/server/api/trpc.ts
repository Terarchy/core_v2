import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { db } from '@/server/db'

/**
 * 1. CONTEXT
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTRPCContext = async (opts: {
  req: Request
  res: Response
}) => {
  const session = await getServerSession(authOptions)

  return {
    db,
    session,
  }
}

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * 3. ROUTER & PROCEDURE
 */
export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

/**
 * Protected procedure middleware
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

/**
 * Role-based protected procedures
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
  }
  return next({ ctx })
})

export const supplierProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (
      ctx.session.user.role !== 'SUPPLIER' &&
      ctx.session.user.role !== 'ADMIN'
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Supplier access required',
      })
    }
    return next({ ctx })
  }
)

export const buyerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== 'BUYER' && ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Buyer access required' })
  }
  return next({ ctx })
})

export const financierProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (
      ctx.session.user.role !== 'FINANCIER' &&
      ctx.session.user.role !== 'ADMIN'
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Financier access required',
      })
    }
    return next({ ctx })
  }
)
