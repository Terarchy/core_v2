import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/landing/Header'

export default function Home() {
  return (
    <main>
      <Header />
      <div className='flex flex-col min-h-screen'>
        {/* Hero Section */}
        <section className='bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24 flex-grow'>
          <div className='container mx-auto px-4 flex flex-col md:flex-row items-center'>
            <div className='md:w-1/2 mb-10 md:mb-0'>
              <h1 className='text-4xl md:text-5xl font-bold mb-6'>
                Revolutionizing Invoice Financing with Blockchain
              </h1>
              <p className='text-xl mb-8 text-gray-600 dark:text-gray-300'>
                Terarchy transforms traditional invoices into digital tokens,
                enabling faster financing, transparent tracking, and secure
                transactions.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link
                  href='/auth/signup?role=SUPPLIER'
                  className='px-6 py-3 bg-blue-500 text-white rounded-md text-center hover:bg-blue-600 transition-colors'
                >
                  Join as Supplier
                </Link>
                <Link
                  href='/auth/signup?role=BUYER'
                  className='px-6 py-3 bg-white border border-blue-500 text-blue-500 rounded-md text-center hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors'
                >
                  Join as Buyer
                </Link>
                <Link
                  href='/auth/signup?role=FINANCIER'
                  className='px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md text-center hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors'
                >
                  Join as Financier
                </Link>
              </div>
            </div>
            <div className='md:w-1/2 pl-0 md:pl-10'>
              <Image
                src='/logos/logo-cover.png'
                alt='Terarchy Platform'
                width={600}
                height={400}
                className='rounded-lg shadow-lg'
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id='features' className='py-16 bg-white dark:bg-gray-900'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>
              Key Features
            </h2>
            <div className='grid md:grid-cols-3 gap-8'>
              {/* Feature 1 */}
              <div className='p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow dark:bg-gray-800'>
                <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-6 h-6 text-blue-500'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>
                  Invoice Tokenization
                </h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Convert traditional invoices into digital tokens on the
                  blockchain for improved transparency and security.
                </p>
              </div>

              {/* Feature 2 */}
              <div className='p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow dark:bg-gray-800'>
                <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-6 h-6 text-blue-500'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Quick Financing</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Access quick invoice financing from multiple financiers with
                  competitive rates through our marketplace.
                </p>
              </div>

              {/* Feature 3 */}
              <div className='p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow dark:bg-gray-800'>
                <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-6 h-6 text-blue-500'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Risk Assessment</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Advanced risk scoring for invoices, providing financiers with
                  reliable data for informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id='how-it-works' className='py-16 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>
              How It Works
            </h2>
            <div className='flex flex-col md:flex-row gap-8'>
              <div className='flex-1'>
                <div className='mb-8'>
                  <h3 className='text-xl font-semibold mb-2'>For Suppliers</h3>
                  <ol className='space-y-4'>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        1
                      </span>
                      <p>Create and submit invoices for buyer approval</p>
                    </li>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        2
                      </span>
                      <p>Once approved, tokenize the verified invoice</p>
                    </li>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        3
                      </span>
                      <p>Receive financing from interested financiers</p>
                    </li>
                  </ol>
                </div>
              </div>
              <div className='flex-1'>
                <div className='mb-8'>
                  <h3 className='text-xl font-semibold mb-2'>For Buyers</h3>
                  <ol className='space-y-4'>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        1
                      </span>
                      <p>Review and approve or reject invoices</p>
                    </li>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        2
                      </span>
                      <p>Track approved and financed invoices</p>
                    </li>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        3
                      </span>
                      <p>Make payments to financiers when invoices are due</p>
                    </li>
                  </ol>
                </div>
              </div>
              <div className='flex-1'>
                <div className='mb-8'>
                  <h3 className='text-xl font-semibold mb-2'>For Financiers</h3>
                  <ol className='space-y-4'>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        1
                      </span>
                      <p>Browse tokenized invoices with risk assessments</p>
                    </li>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        2
                      </span>
                      <p>Finance invoices at competitive interest rates</p>
                    </li>
                    <li className='flex gap-3'>
                      <span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm'>
                        3
                      </span>
                      <p>Receive payments with interest from buyers</p>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className='bg-gray-800 text-white py-12'>
          <div className='container mx-auto px-4'>
            <div className='flex flex-col md:flex-row justify-between'>
              <div className='mb-6 md:mb-0'>
                <div className='flex items-center gap-2 mb-4'>
                  <Image
                    src='/logos/logo.svg'
                    alt='Terarchy Logo'
                    width={30}
                    height={30}
                    className='invert'
                  />
                  <span className='text-xl font-bold'>Terarchy</span>
                </div>
                <p className='max-w-xs text-gray-400'>
                  Transforming invoice financing through blockchain technology
                </p>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-3 gap-8'>
                <div>
                  <h3 className='text-lg font-semibold mb-4'>Platform</h3>
                  <ul className='space-y-2'>
                    <li>
                      <Link
                        href='#features'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='#how-it-works'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        How it Works
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='#'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        Security
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-lg font-semibold mb-4'>Company</h3>
                  <ul className='space-y-2'>
                    <li>
                      <Link
                        href='#'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='#'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='#'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        Careers
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-lg font-semibold mb-4'>Legal</h3>
                  <ul className='space-y-2'>
                    <li>
                      <Link
                        href='#'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='#'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='#'
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        Compliance
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className='border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center'>
              <p className='text-gray-400'>
                © {new Date().getFullYear()} Terarchy. All rights reserved.
              </p>
              <div className='flex gap-4 mt-4 md:mt-0'>
                <Link
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <span className='sr-only'>Twitter</span>
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                    aria-hidden='true'
                  >
                    <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
                  </svg>
                </Link>
                <Link
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <span className='sr-only'>LinkedIn</span>
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
                      clipRule='evenodd'
                    />
                  </svg>
                </Link>
                <Link
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <span className='sr-only'>GitHub</span>
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                      clipRule='evenodd'
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
