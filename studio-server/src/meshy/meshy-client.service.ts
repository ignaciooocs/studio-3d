import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  MeshyImageTo3DRequest,
  MeshyTaskResponse,
  MeshyTaskStatus,
} from './interfaces/meshy-api.interface';
import { MeshyConfig } from './interfaces/meshy-config.interface';

@Injectable()
export class MeshyClientService {
  private readonly config: MeshyConfig;
  private readonly logger = new Logger(MeshyClientService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<MeshyConfig>('meshy')!;
  }

  async createImageTo3DTask(
    request: MeshyImageTo3DRequest,
  ): Promise<MeshyTaskResponse> {
    try {
      // Limpiar el request para no enviar campos undefined
      const cleanRequest = Object.fromEntries(
        Object.entries(request).filter(([_, value]) => value !== undefined)
      ) as MeshyImageTo3DRequest;
      
      // Log request sin el base64 completo para no saturar los logs
      const logRequest = {
        ...cleanRequest,
        image_base64: cleanRequest.image_base64 ? `${cleanRequest.image_base64.substring(0, 50)}... (${cleanRequest.image_base64.length} chars)` : null,
      };
      this.logger.log(`Creating image-to-3d task: ${JSON.stringify(logRequest)}`);
      this.logger.log(`Meshy API URL: ${this.config.baseUrl}/openapi/v1/image-to-3d`);
      this.logger.log(`API Key present: ${!!this.config.apiKey}`);
      this.logger.log(`Request keys: ${Object.keys(cleanRequest).join(', ')}`);
      this.logger.log(`Full request (without base64): ${JSON.stringify(cleanRequest, (key, value) => key === 'image_base64' ? `[BASE64: ${value?.length || 0} chars]` : value)}`);
      
      const response = await firstValueFrom(
        this.httpService.post<MeshyTaskResponse>(
          `${this.config.baseUrl}/openapi/v1/image-to-3d`,
          cleanRequest,
          {
            headers: {
              Authorization: `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: this.config.timeout,
          },
        ),
      );
      this.logger.log(`Image-to-3d task created: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error creating image-to-3d task: ${error.message || error}`);
      if (error.response) {
        this.logger.error(`Meshy API error response: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Status: ${error.response.status}`);
      }
      if (error.request) {
        this.logger.error(`No response received from Meshy API`);
      }
      this.logger.error(`Error stack: ${error.stack}`);
      this.handleError(error, 'Error creating image-to-3d task');
      throw error;
    }
  }

  async getTaskStatus(meshyTaskId: string): Promise<MeshyTaskStatus> {
    try {
      this.logger.log(`Getting task status from Meshy for meshyTaskId: ${meshyTaskId}`);
      const response = await firstValueFrom(
        this.httpService.get<MeshyTaskStatus>(
          `${this.config.baseUrl}/openapi/v1/image-to-3d/${meshyTaskId}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.apiKey}`,
            },
            timeout: this.config.timeout,
          },
        ),
      );

      this.logger.log(`Task status from Meshy: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error getting task status: ${error}`);
      this.handleError(error, 'Error getting task status');
      throw error;
    }
  }

  private handleError(error: any, message: string): void {
    if (error.response) {
      // Error de respuesta de la API
      const status = error.response.status;
      const data = error.response.data;

      throw new HttpException(
        {
          message: data?.message || message,
          statusCode: status,
          error: data?.error || 'Meshy API Error',
        },
        status,
      );
    } else if (error.request) {
      // Error de red
      throw new HttpException(
        {
          message: 'No se pudo conectar con Meshy API',
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Network Error',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      // Error desconocido
      throw new HttpException(
        {
          message: message,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
