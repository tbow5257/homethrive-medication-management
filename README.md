# Medication Management Monorepo

Welcome Homethrivers! 👋 is a monorepo for the Medication Management application, containing both the frontend and backend code, as well as shared types.

## Project Structure

```
medication-management/
├── backend/
│   └── medication-management-api/
│       └── api/                  # Backend API code
│           └── prisma/           # Prisma schema and migrations
├── frontend/                     # Frontend React application
└── shared/
    └── types/                    # Shared TypeScript types
```

## Prerequisites

Before you begin, please ensure you have the following installed:

- **AWS CLI** - For AWS resource management
- **AWS SAM CLI** - For local Lambda development
- **Docker** - For local database and Lambda emulation

### Environment Files

You'll need to set up environment files in the following locations:

1. `backend/medication-management-api/.env`
2. `backend/medication-management-api/api/.env`

For local development, you can copy the example environment files:

```bash
# Copy root API environment file
cp backend/medication-management-api/.env.example backend/medication-management-api/.env

# Copy API environment file
cp backend/medication-management-api/api/.env.example backend/medication-management-api/api/.env
```

## Setup

1. Install dependencies for all packages:

```bash
npm install
```

2. Initialize the database (requires Docker):

```bash
npm run init-db-container
```
> This starts a PostgreSQL container and runs migrations.

3. Build the application:

```bash
npm run build:backend
```
> This builds the Prisma layer, shared types, frontend, and backend.
> 
> The Prisma layer is a Lambda layer that contains the Prisma engine binaries, allowing the Lambda function to use Prisma ORM in AWS.

4. (Optional) Seed the database with test data:

```bash
cd backend/medication-management-api/api && npm run seed
```
> This creates a test admin user (email: admin@example.com, password: Admin123!) and sample data.

## Development

### Start Frontend Development Server

```bash
npm run dev:frontend
```

### Start Backend Development Server

```bash
npm run dev:backend
```

### Start Both Frontend and Backend

```bash
npm run dev
```

## Environment Variables

Make sure you have properly defined environment variables before running the application. For local development, the defaults in `env.json` should work.

## Technical Details

### Prisma Setup

The project uses a custom setup for Prisma in AWS Lambda:

1. **Prisma Layer**: Contains the Prisma engine binaries in a Lambda layer to avoid packaging issues
2. **copy-prisma-engines.js**: Copies Prisma engine binaries to the correct locations for deployment
3. **sync-prisma-schemas.js**: Ensures the Prisma schema is available in both the API and the layer

These solutions address common issues with running Prisma in AWS Lambda environments.

## Building for Production

```bash
npm run build
```

This will:
1. Generate shared types from Prisma schema
2. Build the shared types package
3. Build the frontend
4. Build the backend

## Shared Types

The shared types package generates TypeScript interfaces from the API controllers using TSOA. These controllers define business-specific data structures that extend the base Prisma models to meet application requirements.

The type generation process:
1. TSOA scans the controller files in `backend/medication-management-api/api/src/controllers`
2. It generates an OpenAPI specification based on the controller interfaces and decorators
3. The shared types package uses this specification to create TypeScript interfaces and API client code

When you make changes to the controllers or Prisma schema, run:

```bash
npm run generate-types
```

This ensures type consistency between frontend and backend.

## Benefits of This Setup

1. **Type Safety**: Shared types ensure consistency between frontend and backend
2. **DRY Principle**: Define types once, use them everywhere
3. **Developer Experience**: Better autocomplete and type checking
4. **Maintainability**: Changes to the data model are automatically reflected in the types 