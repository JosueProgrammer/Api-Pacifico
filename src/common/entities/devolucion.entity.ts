import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Venta } from './venta.entity';
import { Usuario } from './usuario.entity';
import { DetalleDevolucion } from './detalle-devolucion.entity';
@Entity({ name: 'devoluciones' })
export class Devolucion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_devolucion', unique: true, nullable: false })
  numeroDevolucion: string;

  @Column({ name: 'venta_id', nullable: false })
  ventaId: string;

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'text', nullable: false })
  motivo: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  tipo: string; // 'parcial', 'total'

  @Column({ name: 'monto_devuelto', type: 'decimal', precision: 10, scale: 2, nullable: false })
  montoDevuelto: number;

  @Column({ type: 'varchar', length: 20, default: 'procesada' })
  estado: string; // 'procesada', 'cancelada'

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  // Relations
  @ManyToOne(() => Venta, { nullable: false })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => DetalleDevolucion, (detalle: DetalleDevolucion) => detalle.devolucion)
  detalles: DetalleDevolucion[];
}
