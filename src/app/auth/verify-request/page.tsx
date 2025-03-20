'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function VerifyRequest() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const error = searchParams.get('error')

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 text-center'>
        <div>
          <Link href='/' className='inline-block'>
            <Image
              src='/logos/logo.svg'
              alt='Terarchy Logo'
              width={60}
              height={60}
              className='mx-auto'
            />
          </Link>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Check your email
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            A sign in link has been sent to{' '}
            {email ? (
              <span className='font-medium'>{email}</span>
            ) : (
              'your email address'
            )}
            .
          </p>
        </div>

        {error && (
          <div className='rounded-md bg-red-50 p-4 mt-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>
                  {error === 'Throttle'
                    ? 'Too many email requests. Please wait a few minutes before trying again.'
                    : 'There was a problem sending the email. Please try again later.'}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className='mt-8 bg-blue-50 p-6 rounded-lg shadow-sm'>
          <div className='flex justify-center mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-12 h-12 text-blue-500'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75'
              />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Next steps:
          </h3>
          <ol className='text-left text-sm space-y-3 text-gray-600'>
            <li className='flex items-start'>
              <span className='flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-3 mt-0.5'>
                1
              </span>
              <span>Check your email inbox for a message from Terarchy.</span>
            </li>
            <li className='flex items-start'>
              <span className='flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-3 mt-0.5'>
                2
              </span>
              <span>
                Click the sign in link in the email. The link will expire in 24
                hours.
              </span>
            </li>
            <li className='flex items-start'>
              <span className='flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-3 mt-0.5'>
                3
              </span>
              <span>
                You&apos;ll be redirected to your dashboard automatically.
              </span>
            </li>
          </ol>
        </div>

        <div className='mt-8'>
          <p className='text-sm text-gray-500'>
            Didn&apos;t receive an email?{' '}
            <Link
              href='/auth/signin'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              Try again
            </Link>{' '}
            or{' '}
            <Link
              href='mailto:support@terarchy.com'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
