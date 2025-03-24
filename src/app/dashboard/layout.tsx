'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOutIcon, Menu, User, FileText} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Image from 'next/image'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    { name: 'Invoices', href: '/dashboard/supplier', icon: FileText },
    { name: 'Account', href: '/dashboard/account', icon: User },
  ]

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='border-b'>
        <div className='flex h-16 items-center px-4 md:px-6'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-56 pt-6'>
              <SheetHeader>
                <div className='flex items-center gap-2'>
                  <Image
                    src='/logos/logo-horizontal.svg'
                    alt='Terarchy Logo'
                    width={120}
                    height={32}
                    className='dark:invert'
                  />
                </div>
              </SheetHeader>
              <nav className='flex flex-col gap-4 py-4'>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-md',
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
                    )}
                  >
                    <item.icon className='h-5 w-5' />
                    {item.name}
                  </Link>
                ))}
                <Button
                  variant='ghost'
                  className='flex items-center justify-start gap-2 text-sm font-medium py-2 px-3 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOutIcon className='h-5 w-5' />
                  Sign Out
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href='/dashboard/supplier' className='flex items-center'>
            <Image
              src='/logos/logo-horizontal.svg'
              alt='Terarchy Logo'
              width={120}
              height={32}
              className='dark:invert'
            />
          </Link>

          <div className='hidden md:flex ml-6 gap-4'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
                )}
              >
                <item.icon className='h-5 w-5' />
                {item.name}
              </Link>
            ))}
          </div>

          <div className='ml-auto flex items-center gap-2'>
            <ThemeToggle />
            <span className='text-sm hidden md:inline-block'>
              {session?.user?.name}
            </span>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => signOut({ callbackUrl: '/' })}
              className='hidden md:flex hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
            >
              <LogOutIcon className='h-5 w-5' />
              <span className='sr-only'>Sign out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='p-4 md:p-6'>{children}</div>
    </div>
  )
}
