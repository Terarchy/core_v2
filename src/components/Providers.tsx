'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { TRPCProvider } from '@/lib/api/trpc'

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <TRPCProvider>{children}</TRPCProvider>
    </SessionProvider>
  )
}
