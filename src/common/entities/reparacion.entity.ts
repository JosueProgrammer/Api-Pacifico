import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from './cliente.entity';

export enum EstadoReparacion {
  RECIBIDO = 'RECIBIDO',
  EN_REVISION = 'EN_REVISION',
  ESPERANDO_REPUESTOS = 'ESPERANDO_REPUESTOS',
  REPARADO = 'REPARADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

@Entity({ name: 'reparaciones' })
export class Reparacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cliente_id', nullable: true })
  clienteId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'varchar', length: 150 })
  dispositivo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelo: string;

  @Column({ name: 'problema_reportado', type: 'text' })
  problemaReportado: string;

  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: EstadoReparacion.RECIBIDO 
  })
  estado: EstadoReparacion;

  @Column({ name: 'precio_estimado', type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioEstimado: number;

  @Column({ name: 'precio_final', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioFinal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  abono: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ name: 'fecha_ingreso', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaIngreso: Date;

  @Column({ name: 'fecha_entrega', type: 'timestamp', nullable: true })
  fechaEntrega: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaActualizacion: Date;
}
