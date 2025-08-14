import { Prisma } from '@prisma/client';

// SQL injection protection for Prisma queries
export class SQLProtection {
  // Sanitize string values for database queries
  static sanitizeForDB(value: any): any {
    if (typeof value === 'string') {
      // Remove potentially dangerous SQL keywords and characters
      return value
        .replace(/[';]|--/g, '') // Remove semicolons and SQL comments
        .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b/gi, '') // Remove SQL keywords
    }
    return value;
  }

  // Validate and sanitize search queries
  static sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    return query
      .replace(/[^\w\s-]/g, '') // Only allow word characters, spaces, and hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  }

  // Safe LIKE query builder for text search
  static createSafeTextSearch(field: string, searchTerm: string): Prisma.StringFilter {
    const sanitizedTerm = this.sanitizeSearchQuery(searchTerm);
    
    if (!sanitizedTerm) {
      return {};
    }

    return {
      contains: sanitizedTerm
    };
  }

  // Safe INT range filter
  static createIntRangeFilter(min?: number, max?: number): Prisma.IntFilter | undefined {
    const filter: any = {};
    
    if (typeof min === 'number' && !isNaN(min) && min >= 0) {
      filter.gte = Math.floor(min);
    }
    
    if (typeof max === 'number' && !isNaN(max) && max >= 0) {
      filter.lte = Math.floor(max);
    }
    
    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  // Safe DECIMAL range filter
  static createDecimalRangeFilter(min?: number, max?: number): Prisma.DecimalFilter | undefined {
    const filter: any = {};
    
    if (typeof min === 'number' && !isNaN(min) && min >= 0) {
      filter.gte = min;
    }
    
    if (typeof max === 'number' && !isNaN(max) && max >= 0) {
      filter.lte = max;
    }
    
    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  // Safe property search with multiple filters
  static createPropertySearchFilters(searchParams: {
    query?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    location?: string;
  }): Prisma.PropertyWhereInput {
    const where: Prisma.PropertyWhereInput = {
      status: 'ACTIVE'
    };

    // Text search across title, description, and location
    if (searchParams.query) {
      const searchFilter = this.createSafeTextSearch('', searchParams.query);
      where.OR = [
        { title: searchFilter },
        { description: searchFilter },
        { location: searchFilter }
      ];
    }

    // Property type filter
    if (searchParams.type && ['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE'].includes(searchParams.type)) {
      where.type = searchParams.type as any;
    }

    // Price range filter
    const priceFilter = this.createDecimalRangeFilter(searchParams.minPrice, searchParams.maxPrice);
    if (priceFilter) {
      where.price = priceFilter;
    }

    // Bedroom range filter
    const bedroomFilter = this.createIntRangeFilter(searchParams.minBedrooms, searchParams.maxBedrooms);
    if (bedroomFilter) {
      where.bedrooms = bedroomFilter;
    }

    // Location filter
    if (searchParams.location) {
      where.location = this.createSafeTextSearch('location', searchParams.location);
    }

    return where;
  }

  // Safe user search filters
  static createUserSearchFilters(searchParams: {
    query?: string;
    role?: string;
    status?: string;
  }): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    // Text search across name and email
    if (searchParams.query) {
      const searchFilter = this.createSafeTextSearch('', searchParams.query);
      where.OR = [
        { name: searchFilter },
        { email: searchFilter }
      ];
    }

    // Role filter
    if (searchParams.role && ['USER', 'ADMIN'].includes(searchParams.role)) {
      where.role = searchParams.role as any;
    }

    // Status filter
    if (searchParams.status && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(searchParams.status)) {
      where.status = searchParams.status as any;
    }

    return where;
  }

  // Safe pagination parameters
  static createSafePagination(page?: number, limit?: number): { skip: number; take: number } {
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    
    return {
      skip: (safePage - 1) * safeLimit,
      take: safeLimit
    };
  }

  // Safe sorting parameters
  static createSafeSorting(sortBy?: string, sortOrder?: string): any {
    const allowedSortFields = [
      'createdAt', 'updatedAt', 'name', 'email', 'title', 'price', 
      'bedrooms', 'bathrooms', 'area', 'location', 'type'
    ];
    
    if (!sortBy || !allowedSortFields.includes(sortBy)) {
      return { createdAt: 'desc' };
    }
    
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    return { [sortBy]: order };
  }

  // Validate and sanitize array of IDs
  static sanitizeIdArray(ids: unknown): string[] {
    if (!Array.isArray(ids)) {
      return [];
    }
    
    return ids
      .filter((id): id is string => typeof id === 'string')
      .map(id => id.trim())
      .filter(id => /^[a-zA-Z0-9_-]+$/.test(id)) // Only allow alphanumeric, underscore, and hyphen
      .slice(0, 100); // Limit array size
  }

  // Validate CUID format
  static isValidCUID(id: string): boolean {
    return typeof id === 'string' && /^c[a-z0-9]{24}$/.test(id);
  }

  // Safe bulk operation filters
  static createBulkOperationFilter(ids: string[]): Prisma.PropertyWhereInput | Prisma.UserWhereInput {
    const sanitizedIds = this.sanitizeIdArray(ids);
    
    if (sanitizedIds.length === 0) {
      throw new Error('No valid IDs provided for bulk operation');
    }
    
    return {
      id: {
        in: sanitizedIds
      }
    };
  }
}

export default SQLProtection;