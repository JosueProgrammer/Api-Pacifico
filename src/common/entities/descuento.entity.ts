import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'descuentos' })
export class Descuento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  codigo: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  tipo: string; // porcentaje, monto_fijo

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  valor: number;

  @Column({ name: 'fecha_inicio', type: 'timestamp', nullable: false })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamp', nullable: false })
  fechaFin: Date;

  @Column({ name: 'activo', default: true })
  activo: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}

