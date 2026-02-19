import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'alertas' })
export class Alerta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  tipo: string; // 'stock_bajo', 'stock_agotado', 'descuento_expira'

  @Column({ type: 'varchar', length: 255, nullable: false })
  titulo: string;

  @Column({ type: 'text', nullable: false })
  mensaje: string;

  @Column({ name: 'entidad_id', type: 'uuid', nullable: true })
  entidadId?: string;

  @Column({ name: 'entidad_tipo', type: 'varchar', length: 50, nullable: true })
  entidadTipo?: string; // 'producto', 'descuento'

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}
