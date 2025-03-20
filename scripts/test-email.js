#!/usr/bin/env node

/**
 * Test Email Script
 *
 * This script tests email delivery using the application's SendGrid configuration.
 * It sends a test email and provides detailed feedback about success or failure.
 * The script helps diagnose issues with email delivery by:
 * - Validating environment variables
 * - Testing SMTP connection
 * - Sending a test email
 * - Providing detailed error diagnostics
 *
 * Usage:
 *   node scripts/test-email.js [recipient@example.com]
 *   npm run test:email [recipient@example.com]
 *
 * If no recipient is provided, it will use the EMAIL_FROM address as the recipient.
 *
 * @author Terarchy Development Team
 */

require('dotenv').config()
const nodemailer = require('nodemailer')
const readline = require('readline')

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

/**
 * Main function that orchestrates the email testing process
 *
 * This function:
 * 1. Validates required environment variables
 * 2. Determines the recipient email address
 * 3. Tests the SMTP connection
 * 4. Sends a test email
 * 5. Provides detailed feedback on success or failure
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the test is complete
 * @throws {Error} If the test fails for any reason
 */
async function main() {
  // Check environment variables
  const requiredVars = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM',
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      '❌ Error: Missing required environment variables:'
    )
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`)
    })
    console.error(
      '\nPlease check your .env file and ensure all variables are set correctly.'
    )
    process.exit(1)
  }

  // Parse the from address to extract email
  let fromName = 'Terarchy'
  let fromEmail = process.env.EMAIL_FROM

  if (process.env.EMAIL_FROM.includes('<')) {
    const matches = process.env.EMAIL_FROM.match(/"?([^"<]+)"?\s*<([^>]+)>/)
    if (matches) {
      fromName = matches[1].trim()
      fromEmail = matches[2].trim()
    }
  }

  // Determine recipient
  let recipient = process.argv[2]

  if (!recipient) {
    console.log(
      '\x1b[33m%s\x1b[0m',
      '⚠️  No recipient specified. Using the sender email as recipient.'
    )
    recipient = fromEmail
  }

  try {
    // Display configuration information
    console.log('\x1b[36m%s\x1b[0m', '🔍 Testing email configuration...')
    console.log('\nEmail Server Details:')
    console.log(`  Host: ${process.env.EMAIL_SERVER_HOST}`)
    console.log(`  Port: ${process.env.EMAIL_SERVER_PORT}`)
    console.log(`  User: ${process.env.EMAIL_SERVER_USER}`)
    console.log(`  From: ${process.env.EMAIL_FROM}`)
    console.log(`  To:   ${recipient}`)
    console.log('\n')

    /**
     * Create SMTP transport for testing
     *
     * This configures Nodemailer with the SendGrid SMTP settings
     * from environment variables, with debug logging enabled.
     */
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      debug: true,
      logger: true,
    })

    // Verify transport configuration
    console.log('\x1b[36m%s\x1b[0m', '🔄 Verifying SMTP connection...')
    await transport.verify()
    console.log(
      '\x1b[32m%s\x1b[0m',
      '✅ SMTP connection verified successfully!'
    )

    // Send test email
    console.log('\x1b[36m%s\x1b[0m', '📧 Sending test email...')

    /**
     * Send a test email using the configured transport
     *
     * This creates a simple HTML email with timestamp information
     * to verify email sending functionality and track delivery.
     *
     * @returns {Promise<Object>} The result object from Nodemailer
     */
    const result = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipient,
      subject: `Test Email from Terarchy [${new Date().toISOString()}]`,
      text: `This is a test email from Terarchy.\n\nThis email was sent using the EMAIL_* environment variables from your .env file.\n\nTimestamp: ${new Date().toISOString()}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; margin-bottom: 20px;">Terarchy Test Email</h2>
          <p>This is a test email from the Terarchy platform.</p>
          <p>This email was sent using the EMAIL_* environment variables from your .env file.</p>
          <div style="margin: 25px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p style="margin: 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            © ${new Date().getFullYear()} Terarchy. All rights reserved.
          </p>
        </div>
      `,
    })

    // Display success information
    console.log('\x1b[32m%s\x1b[0m', '✅ Email sent successfully!')
    console.log('\nResult:')
    console.log(`  Message ID: ${result.messageId}`)
    console.log(`  Response: ${result.response}`)
    console.log(`  Accepted Recipients: ${result.accepted.join(', ')}`)

    if (result.rejected && result.rejected.length > 0) {
      console.log(`  Rejected Recipients: ${result.rejected.join(', ')}`)
    }

    console.log('\n\x1b[32m%s\x1b[0m', '📋 Next steps:')
    console.log('  1. Check the recipient inbox (including spam/junk folder)')
    console.log('  2. Verify the email formatting and content')
    console.log(
      '  3. If using SendGrid, check the activity logs for delivery status'
    )
  } catch (error) {
    // Handle errors with detailed diagnostics
    console.error('\x1b[31m%s\x1b[0m', '❌ Error sending email:')
    console.error(`  ${error.message}`)

    /**
     * Provide specific troubleshooting advice based on error type
     * This helps users diagnose and fix the most common email issues
     */
    if (error.message.includes('535 Authentication')) {
      console.error('\n\x1b[33m%s\x1b[0m', '🔑 Authentication Error:')
      console.error('  - Verify your SendGrid API key is correct and active')
      console.error('  - Ensure the API key has "Mail Send" permissions')
      console.error('  - Check that EMAIL_SERVER_USER is set to "apikey"')
    } else if (error.message.includes('getaddrinfo')) {
      console.error('\n\x1b[33m%s\x1b[0m', '🌐 DNS Error:')
      console.error('  - Check your EMAIL_SERVER_HOST value')
      console.error('  - Verify your internet connection')
      console.error(
        '  - Check if your firewall is blocking outbound connections'
      )
    } else if (error.message.includes('connection refused')) {
      console.error('\n\x1b[33m%s\x1b[0m', '🔌 Connection Error:')
      console.error('  - Verify your EMAIL_SERVER_PORT value')
      console.error(
        '  - Check if your network blocks outbound SMTP connections'
      )
      console.error('  - Ensure your ISP allows connections to port 587')
    }

    process.exit(1)
  } finally {
    // Ensure readline interface is closed
    rl.close()
  }
}

// Execute the main function and handle any uncaught errors
main().catch(console.error)

// Export the main function for testing
module.exports = { main }
