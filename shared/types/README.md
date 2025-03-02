# Shared Types for Medication Management

This package contains shared TypeScript types for the Medication Management application. It automatically generates TypeScript interfaces from the Prisma schema in the backend.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Generate types from Prisma schema:

```bash
npm run generate
```

3. Build the package:

```bash
npm run build
```

## Usage

### In Backend

Add the shared types package as a dependency in your `package.json`:

```json
"dependencies": {
  "@medication-management/shared-types": "1.0.0"
}
```

Then import the types in your code:

```typescript
import { CareRecipient, Medication } from '@medication-management/shared-types';
```

### In Frontend

Add the shared types package as a dependency in your `package.json`:

```json
"dependencies": {
  "@medication-management/shared-types": "1.0.0"
}
```

Then import the types in your code:

```typescript
import { CareRecipient, Medication } from '@medication-management/shared-types';
```

## Development Workflow

1. When you make changes to the Prisma schema in the backend, run:

```bash
npm run generate
```

2. This will update the shared types based on the latest Prisma schema.

3. Build the package:

```bash
npm run build
```

4. The changes will be available to both frontend and backend.

## Monorepo Setup

This package is designed to be used in a monorepo setup with the following structure:

```
medication-management/
├── backend/
│   └── medication-management-api/
│       └── api/
│           └── prisma/
│               └── schema.prisma
├── frontend/
└── shared/
    └── types/
```

The type generation script reads the Prisma schema from the backend and generates TypeScript interfaces in the shared types package. 