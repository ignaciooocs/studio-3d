import { registerAs } from '@nestjs/config';

export default registerAs('meshy', () => ({
  apiKey: process.env.MESHY_API_KEY,
  baseUrl: process.env.MESHY_API_BASE_URL || 'https://api.meshy.ai',
  timeout: parseInt(process.env.MESHY_API_TIMEOUT || '30000', 10),
  defaultModelType:
    (process.env.MESHY_DEFAULT_MODEL_TYPE as 'standard' | 'premium') ||
    'standard',
  defaultPolycount: parseInt(
    process.env.MESHY_DEFAULT_POLYCOUNT || '10000',
    10,
  ),
  maxPolycount: parseInt(process.env.MESHY_MAX_POLYCOUNT || '50000', 10),
  minPolycount: parseInt(process.env.MESHY_MIN_POLYCOUNT || '1000', 10),
  pollingInterval: parseInt(
    process.env.MESHY_POLLING_INTERVAL || '5000',
    10,
  ),
  maxRetries: parseInt(process.env.MESHY_MAX_RETRIES || '3', 10),
}));
