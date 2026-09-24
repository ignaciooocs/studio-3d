export interface MeshyConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  defaultModelType: 'standard' | 'premium';
  defaultPolycount: number;
  maxPolycount: number;
  minPolycount: number;
  pollingInterval: number;
  maxRetries: number;
}
