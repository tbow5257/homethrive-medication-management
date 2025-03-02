# Medication Management Monorepo

This is a monorepo for the Medication Management application, containing both the frontend and backend code, as well as shared types.

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

## Setup

1. Install dependencies for all packages:

```bash
npm install
```

2. Generate shared types from Prisma schema:

```bash
npm run generate-types
```

3. Build shared types:

```bash
npm run build:types
```

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

The shared types package automatically generates TypeScript interfaces from the Prisma schema in the backend. This ensures type consistency between the frontend and backend.

When you make changes to the Prisma schema, run:

```bash
npm run generate-types
```

This will update the shared types based on the latest Prisma schema.

## Benefits of This Setup

1. **Type Safety**: Shared types ensure consistency between frontend and backend
2. **DRY Principle**: Define types once, use them everywhere
3. **Developer Experience**: Better autocomplete and type checking
4. **Maintainability**: Changes to the data model are automatically reflected in the types 