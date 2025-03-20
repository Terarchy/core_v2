'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

/**
 * Maps NextAuth error codes to user-friendly error messages
 *
 * This function translates technical error codes from NextAuth.js into
 * human-readable messages that provide clear guidance to users about what went wrong
 * and what actions they can take to resolve the issue.
 *
 * @param {string|null} error - The error code from NextAuth.js, passed via URL query parameter
 * @returns {string} A user-friendly error message corresponding to the error code
 */
const getErrorMessage = (error: string | null): string => {
  if (!error) return 'An unknown error occurred'

  const errorMessages: Record<string, string> = {
    AccessDenied: 'You do not have permission to sign in.',
    CredentialsSignin: 'Invalid email or password. Please try again.',
    OAuthAccountNotLinked:
      'This email is already associated with another account.',
    EmailSignin: 'There was a problem sending the email. Please try again.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An error occurred during the authentication process.',
    EmailCreateAccount:
      'There was a problem creating your account. Please try again.',
    Verification:
      'The verification link has expired or is invalid. Please request a new one.',
    Configuration:
      'There is a problem with the server configuration. Please contact support.',
    CallbackRouteError:
      'There was a problem with the callback URL. Please try again.',
  }

  return errorMessages[error] || errorMessages.Default
}

/**
 * Authentication Error Page Component
 *
 * Displays user-friendly error messages for authentication-related issues.
 * Gets the error code from URL query parameters and maps it to a readable message.
 * Provides navigation options for users to recover from the error.
 *
 * @returns {JSX.Element} The rendered error page component
 */
export default function ErrorPage() {
  // Extract error code from URL query parameters
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorMessage = getErrorMessage(error)

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
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
            Authentication Error
          </h2>
        </div>

        {/* Error message display */}
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
                {errorMessage}
              </h3>
              {error && (
                <p className='text-xs text-red-600 mt-1'>Error code: {error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation options for recovery */}
        <div className='text-center mt-6'>
          <div className='space-y-4'>
            <div>
              <Link
                href='/auth/signin'
                className='inline-block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Back to Sign In
              </Link>
            </div>
            <div>
              <Link
                href='/'
                className='inline-block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Go to Homepage
              </Link>
            </div>
          </div>

          {/* Support contact information */}
          <div className='mt-6 text-sm text-gray-500'>
            <p>
              Need help?{' '}
              <a
                href='mailto:support@terarchy.com'
                className='text-blue-600 hover:text-blue-500'
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
