'use client'

import AccountSettings from '@/components/dashboard/AccountSettings'

export default function AccountPage() {
  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Account Settings</h1>
      <AccountSettings />
    </div>
  )
}
