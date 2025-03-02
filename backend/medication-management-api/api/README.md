# Medication Management API

This is the backend API for the Medication Management system. It provides endpoints for managing medications, schedules, and doses.

## Technology Stack

- **Node.js** - JavaScript runtime
- **TypeScript** - Typed JavaScript
- **Prisma** - ORM for database access
- **PostgreSQL** - Database
- **AWS Lambda** - Serverless compute
- **AWS API Gateway** - API management
- **AWS SAM** - Serverless Application Model for deployment

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL
- AWS SAM CLI

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials.

4. Generate Prisma client:

```bash
pnpm prisma:generate
```

5. Run database migrations:

```bash
pnpm prisma:migrate:dev
```

### Development

To run the API locally:

```bash
sam local start-api
```

### Database Management

- Generate Prisma client: `pnpm prisma:generate`
- Create a migration: `pnpm prisma:migrate:dev --name <migration-name>`
- Apply migrations: `pnpm prisma:migrate:deploy`
- Open Prisma Studio: `pnpm prisma:studio`

## API Endpoints

- `GET /health` - Health check
- `GET /medications` - Get all medications
- `POST /medications` - Create a new medication
- `GET /medications/{id}` - Get a medication by ID
- `PUT /medications/{id}` - Update a medication
- `DELETE /medications/{id}` - Delete a medication

## Deployment

To deploy the API to AWS:

```bash
sam build
sam deploy --guided
```

## Project Structure

- `app.ts` - Main application entry point
- `src/prisma/` - Prisma schema and migrations
- `src/handlers/` - API handlers
- `src/utils/` - Utility functions
- `src/config/` - Configuration files 