import { ApiResponse, ApiError } from '../types/api';

/**
 * Check if an API response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T> | ApiError): response is ApiResponse<T> {
  return response.success === true;
}

/**
 * Check if an API response is an error
 */
export function isApiError<T>(response: ApiResponse<T> | ApiError): response is ApiError {
  return response.success === false;
}

/**
 * Extract error message from API response
 */
export function getApiErrorMessage(response: ApiResponse<any> | ApiError): string {
  if (isApiError(response)) {
    return response.error?.message || 'Unknown error occurred';
  }
  return 'Success';
}

/**
 * Extract data from API response safely
 */
export function getApiData<T>(response: ApiResponse<T> | ApiError): T | null {
  if (isApiSuccess(response)) {
    return response.data;
  }
  return null;
}

/**
 * Create a standardized error response
 */
export function createApiError(code: string, message: string): ApiError {
  return {
    success: false,
    error: { code, message }
  };
}

/**
 * Create a standardized success response
 */
export function createApiSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(String(field));
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Format API response for display
 */
export function formatApiResponse<T>(response: ApiResponse<T> | ApiError): {
  success: boolean;
  message: string;
  data?: T;
} {
  if (isApiSuccess(response)) {
    return {
      success: true,
      message: 'Operation completed successfully',
      data: response.data
    };
  }
  
  return {
    success: false,
    message: getApiErrorMessage(response)
  };
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Retry function for failed API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

/**
 * Cache API responses in memory
 */
export class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
} 