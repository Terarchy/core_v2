/**
 * React Test Setup
 *
 * This file provides utilities and common mocks for testing React components.
 * It includes custom renderers and mock providers.
 */

import '@testing-library/jest-dom'
import { render as rtlRender } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

// Mock session data
export const mockSession = {
  data: {
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'SUPPLIER',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  status: 'authenticated',
}

/**
 * Custom render function that includes necessary providers
 * @param ui - The React component to render
 * @param options - Additional options for rendering
 * @returns The rendered component with testing utilities
 */
export function render(ui: React.ReactElement, options = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      SessionProvider,
      { session: mockSession },
      children
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { render }
