import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';
import { mkdirSync } from 'fs';

// Ensure logs directory exists
const logsDir = join(process.cwd(), 'logs');
try {
  mkdirSync(logsDir, { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Custom format for development (with colors and emojis)
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const emoji = {
      error: '❌',
      warn: '⚠️ ',
      info: 'ℹ️ ',
      http: '🌐',
      debug: '🔍'
    }[level.replace(/\u001b\[[0-9;]*m/g, '')] || 'ℹ️';

    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }

    return `${emoji} [${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Production format (structured JSON)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
    level: process.env.LOG_LEVEL || 'info'
  })
);

// File transports (for production and development)
if (process.env.NODE_ENV !== 'test') {
  // Combined logs (all levels)
  transports.push(
    new DailyRotateFile({
      filename: join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: productionFormat,
      level: 'debug'
    })
  );

  // Error logs only
  transports.push(
    new DailyRotateFile({
      filename: join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: productionFormat,
      level: 'error'
    })
  );

  // HTTP logs (for API requests)
  transports.push(
    new DailyRotateFile({
      filename: join(logsDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: productionFormat,
      level: 'http'
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: productionFormat,
  defaultMeta: {
    service: 'azure-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  // Don't exit on handled exceptions
  exitOnError: false
});

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new DailyRotateFile({
      filename: join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: productionFormat
    })
  );

  logger.rejections.handle(
    new DailyRotateFile({
      filename: join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: productionFormat
    })
  );
}

// Add custom methods for common use cases
logger.logRequest = function(req, res, duration) {
  const meta = {
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentLength: res.get('Content-Length') || 0,
    requestId: req.id || 'unknown'
  };

  const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${duration}ms`;
  
  // Use different log levels based on status code
  if (res.statusCode >= 500) {
    this.error(message, meta);
  } else if (res.statusCode >= 400) {
    this.warn(message, meta);
  } else {
    this.http(message, meta);
  }
};

logger.logError = function(error, req = null, additional = {}) {
  const meta = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...additional,
  };

  if (req) {
    meta.request = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestId: req.id || 'unknown',
      body: req.body ? JSON.stringify(req.body) : undefined,
      params: req.params,
      query: req.query,
    };
  }

  this.error(error.message, meta);
};

// Create a stream object for Morgan (if you want to use it later)
logger.stream = {
  write: function(message) {
    logger.http(message.trim());
  }
};

export default logger;
