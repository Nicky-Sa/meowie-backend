import { loadEnv } from '../../env/env.config';

export type LoggableObject = Record<string, unknown>;
const env = loadEnv();

const SENSITIVE_KEYS: string[] =
  env.BUILD_ENV !== 'development'
    ? [
        'password',
        'confirmPassword',
        'creditCard',
        'ssn',
        'otp',
        'hashedPassword',
        'token',
        'refreshToken',
        'accessToken',
        'userId',
      ]
    : [];
const REDACTION_PLACEHOLDER = '[REDACTED]';

/**
 * Recursively redacts sensitive fields from an object.
 * @param input The object or array to sanitize.
 * @returns A sanitized clone of the object or array.
 */
export const redactSensitiveInfo = (
  input: LoggableObject | LoggableObject[] | null,
): LoggableObject | LoggableObject[] | null => {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  // Handle arrays (e.g., array of objects)
  if (Array.isArray(input)) {
    return input.map((item) => redactSensitiveInfo(item) as LoggableObject);
  }

  const sanitizedObj: LoggableObject = {};

  const lowerSENSITIVE_KEYS = SENSITIVE_KEYS.map((k) => k.toLowerCase());

  // Handle objects
  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const value = input[key] as LoggableObject;
      const lowerKey = key.toLowerCase();

      if (lowerSENSITIVE_KEYS.map((k) => k.toLowerCase()).includes(lowerKey)) {
        // Redact the sensitive field
        sanitizedObj[key] = REDACTION_PLACEHOLDER;
      } else if (typeof value === 'object' && value !== null) {
        // Recurse into nested objects/arrays
        sanitizedObj[key] = redactSensitiveInfo(value);
      } else {
        // Keep non-sensitive fields
        sanitizedObj[key] = value;
      }
    }
  }

  return sanitizedObj;
};
