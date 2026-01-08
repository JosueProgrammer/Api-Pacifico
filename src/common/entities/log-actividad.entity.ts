import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity({ name: 'logs_actividad' })
export class LogActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: string;

  @Column({ nullable: false })
  accion: string;

  @Column({ nullable: true })
  entidad: string;

  @Column({ name: 'entidad_id', nullable: true })
  entidadId: string;

  @Column({ type: 'json', nullable: true })
  detalles: any;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}

