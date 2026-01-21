import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // ============================================
  // Database Configuration
  // ============================================
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().default('studio_user'),
  DB_PASSWORD: Joi.string().default('studio_password'),
  DB_DATABASE: Joi.string().default('studio_db'),
  DB_SYNCHRONIZE: Joi.boolean().default(true),
  DB_LOGGING: Joi.boolean().default(false),

  // ============================================
  // Meshy API Configuration
  // ============================================
  MESHY_API_KEY: Joi.string()
    .default('your_meshy_api_key_here')
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string().required().messages({
        'any.required': 'MESHY_API_KEY es requerida en producción',
        'string.empty': 'MESHY_API_KEY no puede estar vacía',
      }),
      otherwise: Joi.string().allow('your_meshy_api_key_here'),
    }),
  MESHY_API_BASE_URL: Joi.string().uri().default('https://api.meshy.ai'),
  MESHY_API_TIMEOUT: Joi.number().positive().default(30000),

  // ============================================
  // Meshy Application Configuration
  // ============================================
  MESHY_DEFAULT_MODEL_TYPE: Joi.string()
    .valid('standard', 'premium')
    .default('standard'),
  MESHY_DEFAULT_POLYCOUNT: Joi.number()
    .integer()
    .min(1000)
    .max(50000)
    .default(10000),
  MESHY_MAX_POLYCOUNT: Joi.number().integer().min(1000).max(50000).default(50000),
  MESHY_MIN_POLYCOUNT: Joi.number().integer().min(1000).max(50000).default(1000),

  // ============================================
  // Meshy Task Configuration
  // ============================================
  MESHY_POLLING_INTERVAL: Joi.number().positive().default(5000),
  MESHY_MAX_RETRIES: Joi.number().integer().min(0).max(10).default(3),

  // ============================================
  // Server Configuration
  // ============================================
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});
