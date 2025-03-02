import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Create a standardized API response
 */
export const createResponse = (
  statusCode: number,
  body: Record<string, any> | string,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  // Default headers for CORS
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    ...headers,
  };

  return {
    statusCode,
    headers: defaultHeaders,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
};

/**
 * Success response (200 OK)
 */
export const successResponse = (
  data: Record<string, any> | any[],
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return createResponse(200, { success: true, data }, headers);
};

/**
 * Created response (201 Created)
 */
export const createdResponse = (
  data: Record<string, any>,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return createResponse(201, { success: true, data }, headers);
};

/**
 * No content response (204 No Content)
 */
export const noContentResponse = (
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      ...headers,
    },
    body: '',
  };
};

/**
 * Bad request response (400 Bad Request)
 */
export const badRequestResponse = (
  message = 'Bad request',
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return createResponse(400, { success: false, error: message }, headers);
};

/**
 * Unauthorized response (401 Unauthorized)
 */
export const unauthorizedResponse = (
  message = 'Unauthorized',
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return createResponse(401, { success: false, error: message }, headers);
};

/**
 * Forbidden response (403 Forbidden)
 */
export const forbiddenResponse = (
  message = 'Forbidden',
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return createResponse(403, { success: false, error: message }, headers);
};

/**
 * Not found response (404 Not Found)
 */
export const notFoundResponse = (
  message = 'Resource not found',
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return createResponse(404, { success: false, error: message }, headers);
};

/**
 * Server error response (500 Internal Server Error)
 */
export const serverErrorResponse = (
  message = 'Internal server error',
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return createResponse(500, { success: false, error: message }, headers);
}; 