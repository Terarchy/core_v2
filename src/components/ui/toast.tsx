'use client'

import * as React from 'react'
import { Toaster as RadixToaster } from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const ToastProvider = RadixToaster

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastProvider>,
  React.ComponentPropsWithoutRef<typeof ToastProvider> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastProvider
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = 'Toast'

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = 'ToastTitle'

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
))
ToastDescription.displayName = 'ToastDescription'

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
      className
    )}
    toast-close=''
    {...props}
  >
    <X className='h-4 w-4' />
  </button>
))
ToastClose.displayName = 'ToastClose'

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastProvider.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastProvider.Viewport>
>(({ className, ...props }, ref) => (
  <ToastProvider.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = 'ToastViewport'

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastClose>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
}

export function useToast() {
  const [toasts, setToasts] = React.useState<
    Array<
      ToastProps & {
        id: string
        title?: React.ReactNode
        description?: React.ReactNode
        action?: ToastActionElement
      }
    >
  >([])

  const toast = React.useCallback(
    ({
      title,
      description,
      variant,
      ...props
    }: {
      title?: React.ReactNode
      description?: React.ReactNode
      variant?: 'default' | 'destructive'
    } & Omit<ToastProps, 'children'>) => {
      const id = crypto.randomUUID()
      setToasts((toasts) => [
        ...toasts,
        { id, title, description, variant, ...props },
      ])
      return id
    },
    []
  )

  const dismiss = React.useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }, [])

  const dismissAll = React.useCallback(() => {
    setToasts([])
  }, [])

  return { toast, dismiss, dismissAll, toasts }
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className='grid gap-1'>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
