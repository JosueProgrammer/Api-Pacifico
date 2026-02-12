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
    })
    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @ApiProperty({
        example: '+50588889999',
        description: 'Número de teléfono del proveedor (formato internacional)',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?\d{8,15}$/, {
        message: 'El teléfono debe tener entre 8 y 15 dígitos y puede incluir +',
    })
    telefono: string;

    @ApiProperty({
        example: 'Managua, Nicaragua',
        description: 'Dirección del proveedor',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Length(5, 200)
    direccion?: string;
}
