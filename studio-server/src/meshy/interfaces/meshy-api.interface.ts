import { TaskStatus } from '../enums/task-status.enum';

export interface MeshyImageTo3DRequest {
  image_url?: string;
  image_base64?: string;
  model_type?: 'standard' | 'premium';
  target_polycount?: number;
  should_texture?: boolean;
  should_remesh?: boolean;
  symmetry?: 'none' | 'x' | 'y' | 'z';
  moderation?: boolean;
}

export interface MeshyTaskResponse {
  result: string; // Task ID de Meshy
}

export interface MeshyTaskStatus {
  result: {
    id: string;
    status: TaskStatus;
    progress?: number;
    model_urls?: {
      glb?: string;
      fbx?: string;
      obj?: string;
      usdz?: string;
    };
    error?: string;
  };
}
