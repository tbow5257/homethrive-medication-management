# Testing Authentication Endpoints with Postman

This directory contains a Postman collection for testing the authentication endpoints of the Medication Management API.

## Prerequisites

- [Postman](https://www.postman.com/downloads/) installed
- API running locally using `sam local start-api`

## Setup

1. Import the `auth-collection.json` file into Postman
2. Create a new environment in Postman with a variable named `auth_token` (leave it empty for now)
3. Select the environment you created

## Testing Flow

1. **Health Check**: Test that the API is running
2. **Login**: Use the admin credentials to log in
   - Email: `admin@example.com`
   - Password: `Admin123!`
   - The token will be automatically saved to the `auth_token` environment variable
3. **Register**: Create a new user
4. **Profile**: Get the current user's profile (requires authentication)
5. **Get Medications**: Get all medications (requires authentication)

## Notes

- The collection includes a test script that automatically saves the JWT token to the environment variable `auth_token` when you log in or register
- All authenticated endpoints will use this token automatically
- If you get a 401 Unauthorized error, make sure you've logged in first 