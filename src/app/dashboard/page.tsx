'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      const role = session?.user?.role

      // Redirect to role-specific dashboard
      if (role) {
        if (role === 'SUPPLIER') {
          router.push('/dashboard/supplier')
        } else if (role === 'BUYER') {
          router.push('/dashboard/buyer')
        } else if (role === 'FINANCIER') {
          router.push('/dashboard/financier')
        } else if (role === 'ADMIN') {
          router.push('/dashboard/admin')
        }
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, session, router])

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Image
          src='/logos/logo.svg'
          alt='Terarchy'
          width={80}
          height={80}
          className='mb-4'
        />
        <div className='animate-pulse flex space-x-2 mb-4'>
          <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
          <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
          <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
        </div>
        <h1 className='text-xl font-semibold text-gray-700'>
          {status === 'loading'
            ? 'Loading...'
            : 'Redirecting to your dashboard...'}
        </h1>
      </div>
    )
  }

  return null
}
