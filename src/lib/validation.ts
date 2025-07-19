import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(/^[\+]?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional();
export const urlSchema = z.string().url('Invalid URL format').optional();
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
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
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  price: z.number().min(0, 'Price must be positive'),
  location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE']),
  status: z.enum(['ACTIVE', 'SOLD', 'PENDING']).default('ACTIVE'),
  bedrooms: z.number().int().min(0, 'Bedrooms must be non-negative'),
  bathrooms: z.number().min(0, 'Bathrooms must be non-negative'),
  area: z.number().min(0, 'Area must be positive'),
  features: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
});

export const updatePropertySchema = createPropertySchema.partial();

// Inquiry validation schemas
export const createInquirySchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
});

export const updateInquirySchema = z.object({
  status: z.enum(['PENDING', 'RESPONDED', 'CLOSED']),
});

// Contact validation schemas
export const contactInquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
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
  filters: z.record(z.any()).optional(),
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
  ids: z.array(z.string().uuid('Invalid ID')).min(1, 'At least one ID required'),
  data: z.record(z.any()).optional(),
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