import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { TransformEmail } from '../../common/decorators';

export class LoginUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@api-pacifico.com',
    required: true,
  })
  @TransformEmail()
  @IsEmail({}, { message: 'El correo debe ser una dirección de email válida' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @MaxLength(150, { message: 'El correo debe tener menos de 150 caracteres' })
  correo: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'P@ssw0rd123',
    required: true,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contraseña: string;
}

