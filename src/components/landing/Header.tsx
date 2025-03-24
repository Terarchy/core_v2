'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Image from 'next/image'

export function Header() {
  return (
    <header className='border-b border-border'>
      <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Image
            src='/logos/logo-horizontal.svg'
            alt='Terarchy Logo'
            width={150}
            height={150}
            priority
          />
          {/* <span className='text-xl font-bold'>Terarchy</span> */}
        </div>
        <nav className='hidden md:flex gap-6'>
          <Link
            href='/'
            className='text-foreground hover:text-blue-500 transition-colors'
          >
            Home
          </Link>
          <Link
            href='#features'
            className='text-foreground hover:text-blue-500 transition-colors'
          >
            Features
          </Link>
          <Link
            href='#how-it-works'
            className='text-foreground hover:text-blue-500 transition-colors'
          >
            How it Works
          </Link>
          {/* <Link
            href='#faq'
            className='text-foreground hover:text-blue-500 transition-colors'
          >
            FAQ
          </Link> */}
        </nav>
        <div className='flex gap-3'>
          <ThemeToggle />
          {/* <Link
            href='/auth/signin'
            className='px-4 py-2 border border-blue-500 rounded-md text-blue-500 hover:bg-blue-50 transition-colors'
          >
            Sign In
          </Link> */}
          {/* <Link
            href='/auth/signup'
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
          >
            Sign Up
          </Link> */}
          <Link href='/auth/signin'>
            <Button
              variant='ghost'
              size='sm'
              className='border border-blue-500 rounded-md text-blue-500 hover:bg-blue-50 transition-colors hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
            >
              Sign In
            </Button>
          </Link>
          <Link href='/auth/signup'>
            <Button
              size='sm'
              className='bg-blue-500 hover:bg-blue-600 text-white'
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>

    // <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
    //   <div className='container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0'>
    //     <div className='flex gap-6 md:gap-10'>
    //       <Link href='/' className='flex items-center space-x-2'>
    //         <span className='font-bold text-xl inline-block text-blue-600 dark:text-blue-400'>
    //           Terarchy
    //         </span>
    //       </Link>
    //       <nav className='hidden md:flex gap-6'>
    //         <Link
    //           href='#features'
    //           className='flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
    //         >
    //           Features
    //         </Link>
    //         <Link
    //           href='#solutions'
    //           className='flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
    //         >
    //           Solutions
    //         </Link>
    //         <Link
    //           href='#pricing'
    //           className='flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
    //         >
    //           Pricing
    //         </Link>
    //       </nav>
    //     </div>
    //     <div className='flex flex-1 items-center justify-end space-x-4'>
    //       <nav className='flex items-center space-x-2'>
    //         <ThemeToggle />
    // <Link href='/auth/signin'>
    //   <Button
    //     variant='ghost'
    //     size='sm'
    //     className='hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
    //   >
    //     Sign In
    //   </Button>
    // </Link>
    // <Link href='/auth/signup'>
    //   <Button
    //     size='sm'
    //     className='bg-blue-500 hover:bg-blue-600 text-white'
    //   >
    //     Get Started
    //   </Button>
    // </Link>
    //       </nav>
    //     </div>
    //   </div>
    // </header>
  )
}
