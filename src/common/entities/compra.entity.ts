import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Proveedor } from './proveedor.entity';
import { Usuario } from './usuario.entity';
import { DetalleCompra } from './detalle-compra.entity';

@Entity({ name: 'compras' })
export class Compra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_factura', nullable: true })
  numeroFactura: string;

  @Column({ name: 'proveedor_id', nullable: false })
  proveedorId: string;

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuesto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  estado: string; // pendiente, completada, cancelada

  @Column({ name: 'fecha_compra', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCompra: Date;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @ManyToOne(() => Proveedor, (proveedor: Proveedor) => proveedor.compras, { nullable: false })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => DetalleCompra, (detalleCompra: DetalleCompra) => detalleCompra.compra)
  detalleCompras: DetalleCompra[];
}

