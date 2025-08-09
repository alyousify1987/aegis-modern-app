const config = {
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/aegis_audit',
    pool: {
      min: 2,
      max: 10,
      acquire: 30000,
      idle: 10000
    }
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'aegis:',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-please-use-a-secure-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3001'),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:1420',
      credentials: true
    }
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },

  // File Upload
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    destination: process.env.UPLOAD_PATH || './uploads'
  },

  // Audit Configuration
  audit: {
    retentionPeriod: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555'), // 7 years default
    batchSize: parseInt(process.env.AUDIT_BATCH_SIZE || '100'),
    maxConcurrentAudits: parseInt(process.env.MAX_CONCURRENT_AUDITS || '5')
  },

  // AI/ML Configuration
  ai: {
    enabled: process.env.AI_ENABLED === 'true',
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
  },

  // Email Configuration
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    from: process.env.EMAIL_FROM || 'noreply@aegisaudit.com'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true',
      filename: process.env.LOG_FILE || 'logs/aegis-audit.log',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '14')
    }
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key!!',
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  },

  // Cache Configuration
  cache: {
    defaultTTL: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600'), // 10 minutes
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000')
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    sentryDsn: process.env.SENTRY_DSN,
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '60000') // 1 minute
  },

  // Compliance Standards
  compliance: {
    standards: {
      iso22000: {
        enabled: true,
        version: '2018',
        clauses: 10
      },
      haccp: {
        enabled: true,
        principles: 7
      },
      sfda: {
        enabled: true,
        region: 'saudi_arabia',
        language: 'ar'
      }
    }
  }
};

export default config;
