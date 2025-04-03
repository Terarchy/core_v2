'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { api } from '@/lib/api/trpc'

type UserSettings = {
  email: string
  name: string
  companyName: string
  phoneNumber?: string
  notificationsEnabled: boolean
  twoFactorEnabled: boolean
}

export default function AccountSettings() {
  const utils = api.useUtils()

  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } =
    api.user.getSettings.useQuery(undefined, {
      // Disable automatic refetching on window focus for this demo
      refetchOnWindowFocus: false,
    })

  const [formData, setFormData] = useState<UserSettings>({
    email: '',
    name: '',
    companyName: '',
    phoneNumber: '',
    notificationsEnabled: true,
    twoFactorEnabled: false,
  })

  const [isSaving, setIsSaving] = useState(false)

  // Update state when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        email: settings.email || '',
        name: settings.name || '',
        companyName: settings.companyName || '',
        phoneNumber: settings.phoneNumber || '',
        notificationsEnabled: settings.notificationsEnabled,
        twoFactorEnabled: settings.twoFactorEnabled,
      })
    }
  }, [settings])

  // Update settings mutation
  const updateSettingsMutation = api.user.updateSettings.useMutation({
    onSuccess: () => {
      toast.success('Settings Updated', {
        description: 'Your account settings have been updated successfully.',
      })
      void utils.user.getSettings.invalidate()
    },
    onError: (error) => {
      toast.error('Error', {
        description: error.message,
      })
    },
    onSettled: () => {
      setIsSaving(false)
    },
  })

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    updateSettingsMutation.mutate(formData)
  }

  if (isLoadingSettings) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex justify-center items-center h-40'>
            <div className='animate-pulse text-gray-400'>
              Loading settings...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-foreground'
              >
                Full Name
              </label>
              <Input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='mt-1'
                required
              />
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-foreground'
              >
                Email Address
              </label>
              <Input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='mt-1'
                required
              />
            </div>

            <div>
              <label
                htmlFor='companyName'
                className='block text-sm font-medium text-foreground'
              >
                Company Name
              </label>
              <Input
                type='text'
                id='companyName'
                name='companyName'
                value={formData.companyName}
                onChange={handleChange}
                className='mt-1'
              />
            </div>

            <div>
              <label
                htmlFor='phoneNumber'
                className='block text-sm font-medium text-foreground'
              >
                Phone Number
              </label>
              <Input
                type='tel'
                id='phoneNumber'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
                className='mt-1'
              />
            </div>

            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='notificationsEnabled'
                name='notificationsEnabled'
                checked={formData.notificationsEnabled}
                onChange={handleChange}
                className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
              />
              <label
                htmlFor='notificationsEnabled'
                className='text-sm font-medium text-foreground'
              >
                Enable Notifications
              </label>
            </div>

            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='twoFactorEnabled'
                name='twoFactorEnabled'
                checked={formData.twoFactorEnabled}
                onChange={handleChange}
                className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
              />
              <label
                htmlFor='twoFactorEnabled'
                className='text-sm font-medium text-foreground'
              >
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>

          <div className='pt-4 border-t border-gray-200'>
            <h3 className='text-sm font-medium text-foreground mb-2'>
              Account Security
            </h3>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mr-2'
              onClick={() => {
                toast.success('Password Reset', {
                  description:
                    'Password reset link has been sent to your email.',
                })
              }}
            >
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex justify-end space-x-2 bg-gray-50 px-6 py-3'>
        <Button
          type='button'
          variant='outline'
          disabled={isSaving}
          onClick={() => {
            // Reset form to original settings
            if (settings) {
              setFormData({
                email: settings.email || '',
                name: settings.name || '',
                companyName: settings.companyName || '',
                phoneNumber: settings.phoneNumber || '',
                notificationsEnabled: settings.notificationsEnabled,
                twoFactorEnabled: settings.twoFactorEnabled,
              })
            }
          }}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving} onClick={handleSubmit}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  )
}
