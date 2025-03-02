# Medication Management Frontend

This is the frontend application for the Medication Management system.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following content:
   ```
   VITE_API_URL=http://localhost:3000
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Configuration

The application can work with both a mock API (for development without a backend) and a real API (connecting to the backend).

### Switching between Mock and Real API

To switch between the mock API and the real API, edit the `src/hooks/useApi.ts` file:

```typescript
// API Configuration - Change this to switch between mock and real API
export const USE_MOCK_API = true; // Set to false to use the real API
```

- When `USE_MOCK_API` is `true`, the application will use the mock API with fake data
- When `USE_MOCK_API` is `false`, the application will connect to the real backend API

### Authentication

The authentication system is also configured to work with both APIs:

- Mock API: Uses a simple base64-encoded JSON token
- Real API: Uses JWT tokens from the backend

The system will automatically handle the token format based on the API configuration.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally
- `npm test` - Run tests 