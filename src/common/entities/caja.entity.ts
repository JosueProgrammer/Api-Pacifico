import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { MovimientoCaja } from './movimiento-caja.entity';

export enum EstadoCaja {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
}

@Entity({ name: 'cajas' })
export class Caja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: string;

  @Column({ name: 'fecha_apertura', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaApertura: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamp', nullable: true })
  fechaCierre?: Date;

  @Column({ name: 'monto_inicial', type: 'decimal', precision: 10, scale: 2, default: 0 })
  montoInicial: number;

  @Column({ name: 'monto_final', type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoFinal?: number;

  @Column({ name: 'monto_esperado', type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoEsperado?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  diferencia?: number;

  @Column({ type: 'varchar', length: 20, default: EstadoCaja.ABIERTA })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => MovimientoCaja, (movimiento: MovimientoCaja) => movimiento.caja)
  movimientos: MovimientoCaja[];
}
