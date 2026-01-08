import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  nombre: string;

  @Column({ unique: true, nullable: false })
  correo: string;

  @Column({ nullable: false })
  contraseña: string;

  @Column({ name: 'rol_id', nullable: true })
  rolId: string;

  @Column({ name: 'foto_perfil', nullable: true })
  fotoPerfil: string;

  @Column({ name: 'activo', default: true })
  activo: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaActualizacion: Date;

  // Campos para recuperación de contraseñas
  @Column({ name: 'codigo_recuperacion', nullable: true, length: 4 })
  codigoRecuperacion: string;

  @Column({ name: 'fecha_expiracion_codigo', type: 'timestamp', nullable: true })
  fechaExpiracionCodigo: Date;

  @Column({ name: 'codigo_usado', default: false })
  codigoUsado: boolean;

  @ManyToOne(() => Rol, (rol: Rol) => rol.usuarios, { nullable: true })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;
}

