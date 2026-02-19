import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Compra } from './compra.entity';
import { Producto } from './producto.entity';

@Entity({ name: 'detalle_compras' })
export class DetalleCompra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'compra_id', nullable: false })
  compraId: string;

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

  @ManyToOne(() => Compra, (compra: Compra) => compra.detalleCompras, { nullable: false })
  @JoinColumn({ name: 'compra_id' })
  compra: Compra;

  @ManyToOne(() => Producto, (producto: Producto) => producto.detalleCompras, { nullable: false })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}

