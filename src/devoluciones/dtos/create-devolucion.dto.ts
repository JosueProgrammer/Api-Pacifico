import { IsUUID, IsNotEmpty, IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetalleDevolucionDto {
  @ApiProperty({
    description: 'ID del detalle de venta original',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  detalleVentaId: string;

  @ApiProperty({
    description: 'Cantidad a devolver',
    example: 2.5,
  })
  @IsNotEmpty()
  cantidad: number;
}

export class CreateDevolucionDto {
  @ApiProperty({
    description: 'ID de la venta original',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  ventaId: string;

  @ApiProperty({
    description: 'Motivo de la devolución',
    example: 'Producto defectuoso',
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiProperty({
    description: 'Detalles de los productos a devolver',
    type: [CreateDetalleDevolucionDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleDevolucionDto)
  detalles: CreateDetalleDevolucionDto[];
}
