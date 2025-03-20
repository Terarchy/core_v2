import { type DefaultSession, type NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import bcrypt from 'bcrypt'
import { db } from '@/server/db'

type UserRole = 'ADMIN' | 'SUPPLIER' | 'BUYER' | 'FINANCIER'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
      kycStatus: string
      // ...other properties
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    kycStatus: string
    // ...other properties
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

// Create a custom adapter that extends PrismaAdapter
const customAdapter = {
  ...PrismaAdapter(db),
  getUser: async (id: string) => {
    const user = await db.user.findUnique({ where: { id } })
    if (!user) return null
    return {
      ...user,
      role: user.role as UserRole,
      kycStatus: user.kycStatus as string,
    }
  },
} as Adapter

export const authOptions: NextAuthOptions = {
  callbacks: {
    /**
     * Session callback - Called whenever a session is checked
     * Used to add custom properties to the session object, particularly user role and KYC status
     *
     * @param {Object} params - Session callback parameters
     * @param {Object} params.session - Current session object
     * @param {Object} [params.user] - User object (only available with database sessions)
     * @param {Object} [params.token] - JWT token (only available with JWT sessions)
     * @returns {Object} Modified session object with custom properties
     */
    session: ({ session, user, token }) => {
      if (user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            role: user.role,
            kycStatus: user.kycStatus,
          },
        }
      }

      // For JWT strategy
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role as UserRole,
          kycStatus: token.kycStatus as string,
        },
      }
    },

    /**
     * JWT callback - Called whenever a JWT is created or updated
     * Used to add custom claims to the JWT, particularly user role and KYC status
     *
     * @param {Object} params - JWT callback parameters
     * @param {Object} params.token - Current JWT token
     * @param {Object} [params.user] - User object (only on initial sign in)
     * @returns {Object} Modified JWT token with custom claims
     */
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id
        token.role = user.role
        token.kycStatus = user.kycStatus
      }
      return token
    },
  },
  adapter: customAdapter,
  session: {
    strategy: 'jwt',
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      /**
       * Custom implementation of the sendVerificationRequest function
       * Handles sending magic link emails to users for passwordless authentication
       * Includes detailed error logging and SMTP verification
       *
       * @param {Object} params - Verification request parameters
       * @param {string} params.identifier - User's email address
       * @param {string} params.url - Magic link URL containing the token
       * @param {string} params.token - Authentication token (not used directly in this implementation)
       * @param {Object} params.baseUrl - Base URL of the application (not used directly in this implementation)
       * @param {Object} params.provider - Provider configuration (not used directly in this implementation)
       * @throws {Error} If email sending fails for any reason
       * @returns {Promise<void>} Promise that resolves when the email is sent
       */
      async sendVerificationRequest(params) {
        // Log the parameters (without exposing the full URL which contains sensitive tokens)
        console.log('Sending verification email to:', params.identifier)
        console.log('Email server config:', {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          user: process.env.EMAIL_SERVER_USER,
          // Not logging the password for security
          from: process.env.EMAIL_FROM,
        })

        try {
          // Using nodemailer directly
          const { createTransport } = await import('nodemailer')

          // Create transport with more detailed error handling
          const transport = createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
            // Add debug option in development
            ...(process.env.NODE_ENV !== 'production' && { debug: true }),
          })

          // Verify transport configuration
          try {
            await transport.verify()
            console.log('SMTP connection verified successfully')
          } catch (verifyError) {
            console.error('SMTP verification failed:', verifyError)
            // Continue anyway, maybe the verification failed but sending will work
          }

          const { host } = new URL(params.url)
          const result = await transport.sendMail({
            to: params.identifier,
            from: process.env.EMAIL_FROM,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n\n${params.url}\n\n`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333; margin-bottom: 20px;">Terarchy Sign In</h2>
                <p style="margin-bottom: 15px;">Click the button below to sign in to your Terarchy account.</p>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${params.url}" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                     Sign in to Terarchy
                  </a>
                </div>
                <p style="margin-bottom: 10px; color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                  © ${new Date().getFullYear()} Terarchy. All rights reserved.
                </p>
              </div>
            `,
          })

          console.log('Verification email sent successfully:', {
            messageId: result.messageId,
            response: result.response,
            envelope: result.envelope,
          })
        } catch (error) {
          // Provide more detailed error information
          console.error('Error sending verification email:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            email: params.identifier,
          })

          if (
            error instanceof Error &&
            error.message.includes('535 Authentication')
          ) {
            console.error(
              'Authentication failed: Check your SendGrid API key and permissions'
            )
          } else if (
            error instanceof Error &&
            error.message.includes('getaddrinfo')
          ) {
            console.error(
              'DNS lookup failed: Check your EMAIL_SERVER_HOST value'
            )
          } else if (
            error instanceof Error &&
            error.message.includes('connection refused')
          ) {
            console.error(
              'Connection refused: Check your EMAIL_SERVER_PORT value and network settings'
            )
          }

          throw error
        }
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      /**
       * Authorize function for the Credentials provider
       * Validates user credentials (email/password) against the database
       *
       * @param {Object} credentials - Credentials submitted by the user
       * @param {string} [credentials.email] - User's email address
       * @param {string} [credentials.password] - User's password
       * @returns {Promise<Object|null>} User object if authentication succeeds, null otherwise
       */
      async authorize(credentials) {
        // Validate input - ensure both email and password are provided
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find the user in the database by email
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        // Ensure user exists and has a password
        if (!user || !user.password) {
          return null
        }

        // Verify password using bcrypt
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        // Return null if password doesn't match
        if (!isValid) {
          return null
        }

        // Return user data to be encoded in the JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          kycStatus: user.kycStatus,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
}
