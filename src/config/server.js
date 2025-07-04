require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  environment: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost',
  apiPrefix: process.env.API_PREFIX || '/api',
  jwt: {
    secret: process.env.JWT_SECRET || 
            process.env.AUTH_KEY || 
            'docketcalendar-jwt-secret-key-static-2025',
    expiresIn: process.env.JWT_EXPIRATION || '30d'
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://docketcalendar.com', 'https://www.docketcalendar.com', 'https://api.docketcalendar.com'] 
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true
  },
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 50 : 500, // 50 requests per 15 minutes in production
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests, please try again later.'
    }
  },
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true
    },
    noSniff: true,
    frameguard: { action: 'deny' }
  },
  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
};

module.exports = config; 