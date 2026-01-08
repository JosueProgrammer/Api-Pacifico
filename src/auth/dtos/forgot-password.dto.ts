import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformEmail } from '../../common/decorators';

export class ForgotPasswordDto {
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
}

