import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    IsOptional,
    IsNotEmpty,
    Length,
    Matches,
} from 'class-validator';

export class CreateProveedoreDto {

    @ApiProperty({
        example: 'Distribuidora San José',
        description: 'Nombre del proveedor',
        minLength: 3,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    nombre: string;

    @ApiProperty({
        example: 'contacto@proveedor.com',
        description: 'Correo electrónico del proveedor',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    correo?: string;

    @ApiProperty({
        example: '+505 8888-8888',
        description: 'Número de teléfono del proveedor',
    })
    @IsString()
    @IsNotEmpty()
    telefono: string;

    @ApiProperty({
        example: 'Managua, Nicaragua',
        description: 'Dirección del proveedor',
        required: false,
    })
    @IsOptional()
    @IsString()
    direccion?: string;

    @ApiProperty({
        example: 'Juan Pérez',
        description: 'Persona de contacto',
        required: false,
    })
    @IsOptional()
    @IsString()
    contacto?: string;

    @ApiProperty({
        example: true,
        description: 'Estado del proveedor',
        required: false,
    })
    @IsOptional()
    activo?: boolean;
}
