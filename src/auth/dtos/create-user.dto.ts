import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsEnum,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { TransformTrim, TransformEmail } from '../../common/decorators';
import { UserRole } from '../enums/user-rol.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    required: true,
    maxLength: 100,
    minLength: 3,
  })
  @TransformTrim()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre debe tener menos de 100 caracteres' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@api-pacifico.com',
    required: true,
    maxLength: 150,
    minLength: 5,
  })
  @TransformEmail()
  @IsEmail({}, { message: 'El correo debe ser una dirección de email válida' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @MaxLength(150, { message: 'El correo debe tener menos de 150 caracteres' })
  @MinLength(5, { message: 'El correo debe tener al menos 5 caracteres' })
  correo: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'P@ssw0rd123',
    required: true,
    minLength: 8,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
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
    message:
      'La contraseña debe contener al menos un carácter especial (!@#$%^&*)',
  })
  contraseña: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'Vendedor',
    enum: UserRole,
    required: true,
  })
  @IsEnum(UserRole, { message: 'El rol debe ser uno de los valores válidos' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  rol: UserRole;

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
}

