import { ApiProperty } from '@nestjs/swagger';

export class ProveedoresResponseDto {

    @ApiProperty({
        example: 'a1b2c3d4-e89b-12d3-a456-426614174000',
        description: 'Identificador único del proveedor',
    })
    id: string;

    @ApiProperty({
        example: 'Distribuidora San José',
        description: 'Nombre del proveedor',
    })
    nombre: string;

    @ApiProperty({
        example: 'contacto@proveedor.com',
        description: 'Correo electrónico del proveedor',
    })
    correo: string;

    @ApiProperty({
        example: '+50588889999',
        description: 'Número de teléfono del proveedor',
    })
    telefono: string;

    @ApiProperty({
        example: 'Managua, Nicaragua',
        description: 'Dirección del proveedor',
    })
    direccion: string;

    @ApiProperty({
        example: true,
        description: 'Indica si el proveedor está activo',
    })
    activo: boolean;

    @ApiProperty({
        example: '2024-01-15T10:30:00Z',
        description: 'Fecha de creación del proveedor',
    })
    fechaCreacion: Date;

    @ApiProperty({
        example: '2024-06-01T12:00:00Z',
        description: 'Fecha de última actualización del proveedor',
    })
    fechaActualizacion: Date;
}
