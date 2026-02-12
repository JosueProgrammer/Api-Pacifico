import { ApiProperty } from '@nestjs/swagger';

export class CategoriaResponseDto {
    @ApiProperty({
        description: 'Identificador único de la categoría',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Nombre de la categoría',
        example: 'Electrónica',
    })
    nombre: string;

    @ApiProperty({
        description: 'Descripción de la categoría',
        example: 'Productos electrónicos y dispositivos tecnológicos',
        nullable: true,
    })
    descripcion: string;

    @ApiProperty({
        description: 'URL de la imagen de la categoría',
        example: 'https://example.com/imagen.jpg',
        nullable: true,
    })
    imagen: string;

    @ApiProperty({
        description: 'Indica si la categoría está activa',
        example: true,
    })
    activo: boolean;

    @ApiProperty({
        description: 'Fecha de creación de la categoría',
        example: '2025-01-01T10:30:00.000Z',
    })
    fechaCreacion: Date;
}
