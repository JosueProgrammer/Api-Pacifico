import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { Producto } from './producto.entity';

@Entity({ name: 'detalle_ventas' })
export class DetalleVenta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venta_id', nullable: false })
  ventaId: string;

  @Column({ name: 'producto_id', nullable: false })
  productoId: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: false })
  cantidad: number;

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2, nullable: false })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  subtotal: number;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @ManyToOne(() => Venta, (venta: Venta) => venta.detalleVentas, { nullable: false })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @ManyToOne(() => Producto, (producto: Producto) => producto.detalleVentas, { nullable: false })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}

