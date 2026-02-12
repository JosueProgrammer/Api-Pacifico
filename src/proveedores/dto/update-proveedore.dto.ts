import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateProveedoreDto } from './create-proveedore.dto';
import { IsDateString, IsOptional } from 'class-validator';


export class UpdateProveedoreDto extends PartialType(CreateProveedoreDto) {

    @ApiProperty({
        example: '2024-06-01T12:00:00Z',
        description: 'Fecha de actualización del proveedor',
    })
    @IsOptional()
    @IsDateString()
    fechaActualizacion: Date;
}
