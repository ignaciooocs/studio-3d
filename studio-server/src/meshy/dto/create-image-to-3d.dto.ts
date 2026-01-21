import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateImageTo3DDto {
  @ApiPropertyOptional({
    description: 'URL pública de la imagen a convertir',
    example: 'https://example.com/image.jpg',
    type: String,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.imageBase64)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Imagen codificada en base64 (data URI)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    type: String,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.imageUrl)
  imageBase64?: string;

  @ApiPropertyOptional({
    description: 'Tipo de modelo a generar',
    enum: ['standard', 'premium'],
    example: 'standard',
    default: 'standard',
  })
  @IsOptional()
  @IsEnum(['standard', 'premium'])
  modelType?: 'standard' | 'premium';

  @ApiPropertyOptional({
    description: 'Número objetivo de polígonos (1000-50000)',
    example: 10000,
    minimum: 1000,
    maximum: 50000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(50000)
  targetPolycount?: number;

  @ApiPropertyOptional({
    description: 'Aplicar texturas al modelo',
    example: true,
    default: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  shouldTexture?: boolean;

  @ApiPropertyOptional({
    description: 'Aplicar remallado al modelo',
    example: false,
    default: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  shouldRemesh?: boolean;

  @ApiPropertyOptional({
    description: 'Aplicar simetría al modelo',
    enum: ['none', 'x', 'y', 'z'],
    example: 'none',
    default: 'none',
  })
  @IsOptional()
  @IsEnum(['none', 'x', 'y', 'z'])
  symmetry?: 'none' | 'x' | 'y' | 'z';

  @ApiPropertyOptional({
    description: 'Activar moderación de contenido',
    example: false,
    default: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  moderation?: boolean;
}
