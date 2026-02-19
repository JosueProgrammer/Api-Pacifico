import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Categoria } from './categoria.entity';
import { DetalleVenta } from './detalle-venta.entity';
import { DetalleCompra } from './detalle-compra.entity';
import { Inventario } from './inventario.entity';
import { Proveedor } from './proveedor.entity';
import { UnidadMedida } from './unidad-medida.entity';

@Entity({ name: 'productos' })
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'codigo_barras', unique: true, nullable: true })
  codigoBarras: string;

  @Column({ nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'categoria_id', nullable: true })
  categoriaId: string;

  @Column({ name: 'precio_venta', type: 'decimal', precision: 10, scale: 2, nullable: false })
  precioVenta: number;

  @Column({ name: 'precio_compra', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioCompra: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  stock: number;

  @Column({ name: 'stock_minimo', type: 'decimal', precision: 10, scale: 3, default: 0 })
  stockMinimo: number;

  @Column({ name: 'unidad_medida_id', nullable: true })
  unidadMedidaId: string;

  @ManyToOne(() => UnidadMedida, (unidad: UnidadMedida) => unidad.productos, { nullable: true })
  @JoinColumn({ name: 'unidad_medida_id' })
  unidadMedida: UnidadMedida;

  @Column({ nullable: true })
  imagen: string;

  @Column({ name: 'activo', default: true })
  activo: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaActualizacion: Date;

  @ManyToOne(() => Categoria, (categoria: Categoria) => categoria.productos, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @Column({ name: 'proveedor_id', nullable: true })
  proveedorId: string;

  @ManyToOne(() => Proveedor, { nullable: true })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @OneToMany(() => DetalleVenta, (detalleVenta: DetalleVenta) => detalleVenta.producto)
  detalleVentas: DetalleVenta[];

  @OneToMany(() => DetalleCompra, (detalleCompra: DetalleCompra) => detalleCompra.producto)
  detalleCompras: DetalleCompra[];

  @OneToMany(() => Inventario, (inventario: Inventario) => inventario.producto)
  movimientosInventario: Inventario[];
}

