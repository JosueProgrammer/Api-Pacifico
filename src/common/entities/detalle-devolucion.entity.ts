import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Devolucion } from './devolucion.entity';
import { DetalleVenta } from './detalle-venta.entity';
import { Producto } from './producto.entity';

@Entity({ name: 'detalle_devoluciones' })
export class DetalleDevolucion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'devolucion_id', nullable: false })
  devolucionId: string;

  @Column({ name: 'detalle_venta_id', nullable: false })
  detalleVentaId: string;

  @Column({ name: 'producto_id', nullable: false })
  productoId: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: false })
  cantidad: number;

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2, nullable: false })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  subtotal: number;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  // Relations
  @ManyToOne(() => Devolucion, (devolucion: Devolucion) => devolucion.detalles, { nullable: false })
  @JoinColumn({ name: 'devolucion_id' })
  devolucion: Devolucion;

  @ManyToOne(() => DetalleVenta, { nullable: false })
  @JoinColumn({ name: 'detalle_venta_id' })
  detalleVenta: DetalleVenta;

  @ManyToOne(() => Producto, { nullable: false })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
