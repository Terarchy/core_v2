'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api/trpc'

// For UI display
type UserRole = 'SUPPLIER' | 'BUYER' | 'FINANCIER'

export default function SignUp() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const initialRole = roleParam
    ? (roleParam.toUpperCase() as UserRole)
    : 'SUPPLIER'

  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    companyName: '',
    companyRegistrationNo: '',
    phoneNumber: '',
    address: '',
    country: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear any errors for this field when user changes it
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const registerMutation = api.user.register.useMutation({
    onSuccess: () => {
      router.push('/auth/signin?registered=true')
    },
    onError: (error) => {
      console.error('Registration error:', error)
      if (error.message.includes('email already exists')) {
        setFormErrors((prev) => ({
          ...prev,
          email:
            'This email is already registered. Please use a different one or sign in.',
        }))
      } else {
        setFormErrors((prev) => ({
          ...prev,
          form: 'An error occurred during registration. Please try again.',
        }))
      }
      setIsLoading(false)
    },
  })

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (formData.role === 'FINANCIER' || formData.role === 'SUPPLIER') {
      if (!formData.companyName.trim()) {
        errors.companyName = 'Company name is required'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registrationData } = formData

    try {
      await registerMutation.mutateAsync(registrationData)
    } catch (error) {
      console.error('Registration submission error:', error)
      setIsLoading(false)
    }
  }

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
            Create your account
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Already have an account?{' '}
            <Link
              href='/auth/signin'
              className='font-medium text-blue-600 hover:text-blue-500 hover:cursor-pointer'
            >
              Sign in
            </Link>
          </p>
        </div>

        {formErrors.form && (
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
                  {formErrors.form}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm -space-y-px'>
            <div>
              <label htmlFor='name' className='sr-only'>
                Full Name
              </label>
              <input
                id='name'
                name='name'
                type='text'
                autoComplete='name'
                required
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder='Full Name'
              />
              {formErrors.name && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <input
                id='email-address'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder='Email address'
              />
              {formErrors.email && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder='Password (min. 8 characters)'
              />
              {formErrors.password && (
                <p className='mt-1 text-sm text-red-600'>
                  {formErrors.password}
                </p>
              )}
            </div>
            <div>
              <label htmlFor='confirmPassword' className='sr-only'>
                Confirm Password
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                autoComplete='new-password'
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.confirmPassword
                    ? 'border-red-300'
                    : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder='Confirm Password'
              />
              {formErrors.confirmPassword && (
                <p className='mt-1 text-sm text-red-600'>
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
            <div>
              <label htmlFor='role' className='sr-only'>
                Account Type
              </label>
              <select
                id='role'
                name='role'
                value={formData.role}
                onChange={handleChange}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
              >
                <option value='SUPPLIER'>Supplier</option>
                <option value='BUYER'>Buyer</option>
                <option value='FINANCIER'>Financier</option>
              </select>
            </div>
            <div>
              <label htmlFor='companyName' className='sr-only'>
                Company Name
              </label>
              <input
                id='companyName'
                name='companyName'
                type='text'
                autoComplete='organization'
                value={formData.companyName}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.companyName ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder='Company Name'
                required={
                  formData.role === 'SUPPLIER' || formData.role === 'FINANCIER'
                }
              />
              {formErrors.companyName && (
                <p className='mt-1 text-sm text-red-600'>
                  {formErrors.companyName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor='companyRegistrationNo' className='sr-only'>
                Company Registration Number
              </label>
              <input
                id='companyRegistrationNo'
                name='companyRegistrationNo'
                type='text'
                value={formData.companyRegistrationNo}
                onChange={handleChange}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Company Registration Number (optional)'
              />
            </div>
            <div>
              <label htmlFor='phoneNumber' className='sr-only'>
                Phone Number
              </label>
              <input
                id='phoneNumber'
                name='phoneNumber'
                type='tel'
                autoComplete='tel'
                value={formData.phoneNumber}
                onChange={handleChange}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Phone Number (optional)'
              />
            </div>
            <div>
              <label htmlFor='country' className='sr-only'>
                Country
              </label>
              <input
                id='country'
                name='country'
                type='text'
                autoComplete='country'
                value={formData.country}
                onChange={handleChange}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Country (optional)'
              />
            </div>
            <div>
              <label htmlFor='address' className='sr-only'>
                Address
              </label>
              <input
                id='address'
                name='address'
                type='text'
                autoComplete='street-address'
                value={formData.address}
                onChange={handleChange}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Address (optional)'
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <span className='absolute left-0 inset-y-0 flex items-center pl-3'>
                  <svg
                    className='animate-spin h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                </span>
              ) : (
                <span className='absolute left-0 inset-y-0 flex items-center pl-3'>
                  <svg
                    className='h-5 w-5 text-blue-500 group-hover:text-blue-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='white'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 3a7 7 0 100 14 7 7 0 000-14zm-5 7a5 5 0 1110 0 5 5 0 01-10 0z'
                      clipRule='evenodd'
                    />
                    <path
                      fillRule='evenodd'
                      d='M10 12a2 2 0 100-4 2 2 0 000 4z'
                      clipRule='evenodd'
                    />
                  </svg>
                </span>
              )}
              Sign up
            </button>
          </div>

          <div className='mt-4 text-sm text-gray-600 text-center'>
            By signing up, you agree to our{' '}
            <Link
              href='/terms'
              className='font-medium text-blue-600 hover:text-blue-500 hover:cursor-pointer'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='font-medium text-blue-600 hover:text-blue-500 hover:cursor-pointer'
            >
              Privacy Policy
            </Link>
            .
          </div>
        </form>
      </div>
    </div>
  )
}
