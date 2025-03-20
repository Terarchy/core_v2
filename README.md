# Terarchy - Invoice Tokenization Platform

Terarchy is a blockchain-based platform for invoice tokenization and financing. It transforms traditional invoices into digital tokens, enabling faster financing, transparent tracking, and secure transactions between suppliers, buyers, and financiers.

## Key Features

- **Invoice Management**: Create, submit, approve/reject, and track invoices
- **Tokenization**: Convert approved invoices into digital tokens (simulated blockchain integration)
- **Financing Marketplace**: Connect suppliers with financiers for invoice financing
- **Risk Assessment**: Advanced scoring system to evaluate invoice risk
- **KYC/KYB/AML**: Identity verification for all users with additional checks for financiers
- **Role-Based Access**: Dedicated workflows for suppliers, buyers, and financiers

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: Node.js with Next.js API routes (tRPC)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with email and credentials providers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Terarchy/core_v2.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env.local` and update the variables with your credentials.

```bash
cp .env.example .env.local
```

4. Set up the database:

```bash
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
terarchy/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard pages for different roles
│   │   └── ...
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utility functions and services
│   │   └── api/                # API client setup (tRPC)
│   └── server/                 # Server-side code
│       ├── api/                # tRPC API routers
│       ├── auth.ts             # Authentication configuration
│       └── db/                 # Database client
├── prisma/                     # Prisma ORM schema and migrations
│   └── schema.prisma           # Database schema
└── public/                     # Static assets
    └── logos/                  # Logo files
```

## Testing

Terarchy uses a comprehensive testing setup with Jest and React Testing Library to ensure code quality and reliability.

### Testing Architecture

```
terarchy/
├── __mocks__/                  # Global mocks for files and styles
├── jest.config.js              # Jest configuration
└── src/
    └── __tests__/              # Test files
        ├── auth/               # Authentication tests
        ├── setup/              # Test setup utilities
        └── setupTests.ts       # Test environment configuration
```

### Test Types

- **Unit Tests**: Individual components and functions
- **Integration Tests**: API routes and data flow
- **Authentication Tests**: User authentication flows
- **Email Tests**: Email delivery functionality

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Test email functionality
npm run test:email
```

### Test Documentation

All test files are thoroughly documented, explaining:

- The purpose of each test suite
- Testing methodologies used
- Mock data and configurations
- Expected behaviors

### Key Testing Features

- **Custom Render Function**: Wraps components with providers (SessionProvider, etc.)
- **Mocked Authentication**: Pre-configured test user sessions
- **Middleware Testing**: Route protection and role-based access
- **Email Verification**: SendGrid integration tests

## User Roles and Workflows

### Supplier

1. Create and submit invoices for buyer approval
2. Tokenize approved invoices
3. Receive financing from financiers
4. Track payment status

### Buyer

1. Review and approve/reject invoices
2. Track approved invoices
3. Make payments to financiers or suppliers

### Financier

1. Complete KYC/KYB/AML verification
2. Browse tokenized invoices with risk assessments
3. Finance invoices at competitive interest rates
4. Receive repayments with interest

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

Built with ❤️ using Next.js, Prisma, tRPC, and NextAuth.
