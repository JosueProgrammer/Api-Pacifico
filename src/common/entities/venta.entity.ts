import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from './cliente.entity';
import { Usuario } from './usuario.entity';
import { DetalleVenta } from './detalle-venta.entity';
import { MetodoPago } from './metodo-pago.entity';
import { Descuento } from './descuento.entity';
import { EstadoVenta } from '../../ventas/dtos/create-venta.dto';

@Entity({ name: 'ventas' })
export class Venta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_factura', unique: true, nullable: false })
  numeroFactura: string;

  @Column({ name: 'cliente_id', nullable: true })
  clienteId: string;

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuesto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'metodo_pago_id', nullable: true })
  metodoPagoId: string;

  @Column({ type: 'varchar', length: 50, default: EstadoVenta.COMPLETADA })
  estado: string; // pendiente, completada, cancelada, borrador

  @Column({ name: 'fecha_venta', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaVenta: Date;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @ManyToOne(() => Cliente, (cliente: Cliente) => cliente.ventas, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => MetodoPago, { nullable: true })
  @JoinColumn({ name: 'metodo_pago_id' })
  metodoPago: MetodoPago;
  
  @Column({ name: 'descuento_id', nullable: true })
  descuentoId: string | null;

  @ManyToOne(() => Descuento, { nullable: true })
  @JoinColumn({ name: 'descuento_id' })
  descuentoEntidad: Descuento;

  @OneToMany(() => DetalleVenta, (detalleVenta: DetalleVenta) => detalleVenta.venta)
  detalleVentas: DetalleVenta[];
}

