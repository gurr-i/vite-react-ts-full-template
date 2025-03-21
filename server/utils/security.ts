/**
 * Utility functions for security-related operations
 */

/**
 * Validates if the given origin is allowed to access the API
 * @param origin The origin to validate
 * @returns boolean indicating if the origin is valid
 */
export function isValidOrigin(origin: string): boolean {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:4000',
    'http://localhost:5173',
    process.env.ALLOWED_ORIGIN, // Additional origins from environment
  ].filter(Boolean);

  return allowedOrigins.includes(origin);
}