export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://greenbeam-backend.onrender.com/api/v1',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000'),
  },
  
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiryBuffer: parseInt(process.env.NEXT_PUBLIC_TOKEN_EXPIRY_BUFFER || '300000'), // 5 minutes
  },
  
  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedFileTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxFilesPerUpload: parseInt(process.env.NEXT_PUBLIC_MAX_FILES_PER_UPLOAD || '10'),
  },
  
  pagination: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '20'),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100'),
  },
  
  cache: {
    defaultTTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000'), // 5 minutes
    maxCacheSize: parseInt(process.env.NEXT_PUBLIC_MAX_CACHE_SIZE || '100'),
  },
  
  features: {
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
    enableFileUpload: process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD !== 'false',
    enableRealTimeUpdates: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES === 'true',
    enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  },
  
  development: {
    enableMockData: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
    enableApiLogging: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_API_LOGGING !== 'false',
    mockApiDelay: parseInt(process.env.NEXT_PUBLIC_MOCK_API_DELAY || '500'),
  },
} as const;

export type Config = typeof config;

// Environment-specific overrides
export const getConfig = (): Config => {
  const env = process.env.NODE_ENV;
  
  if (env === 'development') {
    return {
      ...config,
      api: {
        ...config.api,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://greenbeam-backend.onrender.com/api/v1',
      },
    };
  }
  
  if (env === 'production') {
    return {
      ...config,
      api: {
        ...config.api,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.greenbeam.com/api/v1',
      },
      features: {
        ...config.features,
        enableRealTimeUpdates: false,
        enableOfflineMode: false,
      },
      development: {
        ...config.development,
        enableMockData: false,
        enableApiLogging: false,
      },
    };
  }
  
  return config;
};

// Validation function to ensure required environment variables are set
export const validateConfig = (): string[] => {
  const errors: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
    errors.push('NEXT_PUBLIC_API_URL is required in production');
  }
  
  return errors;
};

// Get current configuration
export const currentConfig = getConfig(); 