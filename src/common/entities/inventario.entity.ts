import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from './producto.entity';
import { Usuario } from './usuario.entity';

@Entity({ name: 'inventario' })
export class Inventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'producto_id', nullable: false })
  productoId: string;

  @Column({ name: 'tipo_movimiento', type: 'varchar', length: 50, nullable: false })
  tipoMovimiento: string; // entrada, salida, ajuste

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: false })
  cantidad: number;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ name: 'referencia_id', nullable: true })
  referenciaId: string; // ID de venta, compra, etc.

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: string;

  @Column({ name: 'fecha_movimiento', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaMovimiento: Date;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @ManyToOne(() => Producto, (producto: Producto) => producto.movimientosInventario, { nullable: false })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}

