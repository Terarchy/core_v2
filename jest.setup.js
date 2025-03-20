// Add custom Jest matchers for testing library
require('@testing-library/jest-dom')

// Mock process.env
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.EMAIL_SERVER_HOST = 'smtp.sendgrid.net'
process.env.EMAIL_SERVER_PORT = '587'
process.env.EMAIL_SERVER_USER = 'apikey'
process.env.EMAIL_SERVER_PASSWORD = 'test-password'
process.env.EMAIL_FROM = 'test@example.com'
process.env.SENDGRID_API_KEY = 'test-sendgrid-key'
