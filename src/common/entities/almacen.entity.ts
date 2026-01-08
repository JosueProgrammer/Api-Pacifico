import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'almacenes' })
export class Almacen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ name: 'activo', default: true })
  activo: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}

