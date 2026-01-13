import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsString, MaxLength } from "class-validator";

export class CreateClienteDto {
    @ApiProperty({
        description: "Nombre del cliente",
        example: "Josue Bermudez",
        required: true,
        maxLength: 60
    })
    @MaxLength(50, { message: "El nombre debe tener menos de 50 caracteres" })
    @IsString({ message: "El nombre debe ser una cadena de texto" })
    nombre: string;

    @ApiProperty({
        description: "correo del cliente",
        example: "bermudezjosue183@gmail.com",
        required: true,
        maxLength: 100

    })
    @IsString({ message: "El correo debe ser una cadena de texto" })
    @MaxLength(100, { message: "El correo debe tener menos de 100 caracteres" })
    correo: string;

    @ApiProperty({
        description: "Teléfono del cliente",
        example: "555-1234-567",
        required: false,
        maxLength: 15
    })
    @IsString({ message: "El teléfono debe ser una cadena de texto" })
    @MaxLength(15, { message: "El teléfono debe tener menos de 15 caracteres" })
    telefono: string;

    @ApiProperty({
        description: "indica que el cliente este activo o no",
        example: true,
        required: false
    })
    @IsBoolean({ message: "El valor debe ser booleano" })
    activo: boolean

}
