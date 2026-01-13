import { ApiProperty } from '@nestjs/swagger';

export class ClienteResponseDto {
    @ApiProperty({
        description: 'Identificador único del cliente',
        example: 'a3f1c2b4-8e9d-4f2a-bc1e-123456789abc',
    })
    id: string;

    @ApiProperty({
        description: 'Nombre del cliente',
        example: 'Juan Pérez',
    })
    nombre: string;

    @ApiProperty({
        description: 'Correo electrónico del cliente',
        example: 'juan.perez@email.com',
        nullable: true,
    })
    correo: string;

    @ApiProperty({
        description: 'Teléfono del cliente',
        example: '+505 8888 9999',
        nullable: true,
    })
    telefono: string;

    @ApiProperty({
        description: 'Indica si el cliente está activo',
        example: true,
    })
    activo: boolean;

    @ApiProperty({
        description: 'Fecha de creación del cliente',
        example: '2025-01-01T10:30:00.000Z',
    })
    fechaCreacion: Date;

    @ApiProperty({
        description: 'Fecha de última actualización del cliente',
        example: '2025-01-02T15:45:00.000Z',
    })
    fechaActualizacion: Date;
}
