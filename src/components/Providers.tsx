'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { TRPCProvider } from '@/lib/api/trpc'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ThemeProvider'

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <SessionProvider session={session}>
        <TRPCProvider>
          {children}
          <Toaster />
        </TRPCProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
