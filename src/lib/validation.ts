import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// SQL injection prevention patterns
const sqlInjectionPatterns = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
  /(\b(or|and)\b\s*\d+\s*=\s*\d+)/gi,
  /(--|\/\*|\*\/|;)/g,
  /('|\"|`)/g,
];

export function containsSqlInjection(input: string): boolean {
  return sqlInjectionPatterns.some(pattern => pattern.test(input));
}

// XSS prevention
const xssPatterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
];

export function containsXss(input: string): boolean {
  return xssPatterns.some(pattern => pattern.test(input));
}

// Enhanced validation with security checks
export function createSecureTextSchema(minLength: number, maxLength: number, fieldName: string) {
  return z.string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must not exceed ${maxLength} characters`)
    .refine((value) => !containsSqlInjection(value), `${fieldName} contains potentially dangerous content`)
    .refine((value) => !containsXss(value), `${fieldName} contains potentially dangerous scripts`)
    .transform(sanitizeText);
}

// Common validation schemas with enhanced security
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must not exceed 254 characters')
  .refine((email) => !/[<>'"&]/.test(email), 'Email contains invalid characters')
  .transform(sanitizeEmail);

export const phoneSchema = z.string()
  .regex(/^[\+]?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .max(20, 'Phone number too long')
  .optional();

export const urlSchema = z.string()
  .url('Invalid URL format')
  .refine((url) => url.startsWith('https://') || url.startsWith('http://'), 'URL must use HTTP or HTTPS')
  .or(z.literal(''))
  .optional();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');

// User validation schemas
export const createUserSchema = z.object({
  name: createSecureTextSchema(1, 100, 'Name'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

export const updateUserSchema = z.object({
  name: createSecureTextSchema(1, 100, 'Name').optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  role: z.enum(['USER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Property validation schemas
export const createPropertySchema = z.object({
  title: createSecureTextSchema(1, 200, 'Title'),
  description: createSecureTextSchema(0, 2000, 'Description').optional(),
  price: z.number().min(0, 'Price must be positive'),
  location: createSecureTextSchema(1, 200, 'Location'),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL', 'LAND']),
  status: z.enum(['ACTIVE', 'SOLD', 'PENDING', 'INACTIVE']).default('ACTIVE'),
  bedrooms: z.number().int().min(0, 'Bedrooms must be non-negative'),
  bathrooms: z.number().min(0, 'Bathrooms must be non-negative'),
  area: z.number().min(0, 'Area must be positive'),
  features: z.array(createSecureTextSchema(1, 100, 'Feature')).optional(),
  isFeatured: z.boolean().default(false),
});

export const updatePropertySchema = createPropertySchema.partial();

// Inquiry validation schemas
export const createInquirySchema = z.object({
  propertyId: z.string().cuid('Invalid property ID format'),
  message: createSecureTextSchema(1, 1000, 'Message'),
});

export const updateInquirySchema = z.object({
  status: z.enum(['PENDING', 'RESPONDED', 'CLOSED']),
});

// Contact validation schemas
export const contactInquirySchema = z.object({
  name: createSecureTextSchema(1, 100, 'Name'),
  email: emailSchema,
  phone: phoneSchema,
  subject: createSecureTextSchema(1, 200, 'Subject'),
  message: createSecureTextSchema(1, 1000, 'Message'),
});

// Office settings validation schema
export const officeSettingsSchema = z.object({
  companyName: z.string().max(200, 'Company name too long').optional(),
  address: z.string().max(300, 'Address too long').optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
  website: urlSchema,
  logoUrl: urlSchema,
  mondayHours: z.string().max(50, 'Hours format too long').optional(),
  tuesdayHours: z.string().max(50, 'Hours format too long').optional(),
  wednesdayHours: z.string().max(50, 'Hours format too long').optional(),
  thursdayHours: z.string().max(50, 'Hours format too long').optional(),
  fridayHours: z.string().max(50, 'Hours format too long').optional(),
  saturdayHours: z.string().max(50, 'Hours format too long').optional(),
  sundayHours: z.string().max(50, 'Hours format too long').optional(),
  // Analytics & Tracking
  gtmContainerId: z.string().max(50, 'GTM Container ID too long').optional(),
  gtmEnabled: z.boolean().optional(),
  ga4MeasurementId: z.string().max(50, 'GA4 Measurement ID too long').optional(),
  ga4Enabled: z.boolean().optional(),
  facebookPixelId: z.string().max(50, 'Facebook Pixel ID too long').optional(),
  facebookPixelEnabled: z.boolean().optional(),
});

// Analytics query validation
export const analyticsQuerySchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be positive').default(1),
  limit: z.number().int().min(1, 'Limit must be positive').max(100, 'Limit too large').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().max(200, 'Search query too long').optional(),
  filters: z.record(z.string(), z.any()).optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename required'),
  mimetype: z.string().regex(/^(image|application|text)\//, 'Invalid file type'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
});

// Bulk operations schema
export const bulkOperationSchema = z.object({
  action: z.enum(['delete', 'update', 'activate', 'deactivate']),
  ids: z.array(z.string().cuid('Invalid ID format')).min(1, 'At least one ID required'),
  data: z.record(z.string(), z.any()).optional(),
});

// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string; details: any[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.issues
      };
    }
    return {
      success: false,
      error: 'Unknown validation error',
      details: []
    };
  }
}

// Helper function to validate query parameters
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: Record<string, string>): { success: true; data: T } | { success: false; error: string; details: any[] } {
  try {
    // Convert string values to appropriate types
    const processedParams: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value === 'true') processedParams[key] = true;
      else if (value === 'false') processedParams[key] = false;
      else if (!isNaN(Number(value)) && value !== '') processedParams[key] = Number(value);
      else processedParams[key] = value;
    }
    
    const result = schema.parse(processedParams);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Query parameter validation failed',
        details: error.issues
      };
    }
    return {
      success: false,
      error: 'Unknown validation error',
      details: []
    };
  }
}