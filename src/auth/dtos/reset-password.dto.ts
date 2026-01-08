import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformEmail, TransformTrim } from '../../common/decorators';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario',
        example: 'usuario@ejemplo.com',
        maxLength: 150,
        minLength: 5,
    })
    @TransformEmail()
    @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
    @IsNotEmpty({ message: 'El correo electrónico es requerido' })
    @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
    @MaxLength(150, { message: 'El correo debe tener menos de 150 caracteres' })
    @MinLength(5, { message: 'El correo debe tener al menos 5 caracteres' })
    correo: string;

    @ApiProperty({
        description: 'Código de verificación de 4 dígitos',
        example: '1234',
    })
    @TransformTrim()
    @IsNotEmpty({ message: 'El código de verificación es requerido' })
    @IsString({ message: 'El código debe ser una cadena de texto' })
    @Length(4, 4, { message: 'El código debe tener exactamente 4 dígitos' })
    @Matches(/^\d{4}$/, { message: 'El código debe contener solo números' })
    codigo: string;

    @ApiProperty({
        description:
            'Nueva contraseña (mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y carácter especial)',
        example: 'NuevaContraseña123!',
    })
    @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @Length(8, 50, {
        message: 'La contraseña debe tener entre 8 y 50 caracteres',
    })
    @Matches(/(?=.*[A-Z])/, {
        message: 'La contraseña debe contener al menos una letra mayúscula',
    })
    @Matches(/(?=.*[a-z])/, {
        message: 'La contraseña debe contener al menos una letra minúscula',
    })
    @Matches(/(?=.*[0-9])/, {
        message: 'La contraseña debe contener al menos un número',
    })
    @Matches(/(?=.*[!@#$%^&*])/, {
        message: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)',
    })
    nuevaContraseña: string;
}

