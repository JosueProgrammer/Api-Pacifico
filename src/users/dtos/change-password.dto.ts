import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldP@ssw0rd123',
    description: 'La contraseña actual del usuario (Opcional para administradores)',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'La contraseña actual debe ser un texto' })
  currentPassword?: string;

  @ApiProperty({
    example: 'NewP@ssw0rd123!',
    description: 'La nueva contraseña para el usuario',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La nueva contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
