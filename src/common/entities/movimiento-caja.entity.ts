import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Caja } from './caja.entity';
import { Usuario } from './usuario.entity';

export enum TipoMovimientoCaja {
  VENTA = 'venta',
  DEVOLUCION = 'devolucion',
  RETIRO = 'retiro',
  DEPOSITO = 'deposito',
}

@Entity({ name: 'movimientos_caja' })
export class MovimientoCaja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'caja_id', nullable: false })
  cajaId: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  tipo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  monto: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  concepto?: string;

  @Column({ name: 'referencia_id', type: 'uuid', nullable: true })
  referenciaId?: string;

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @ManyToOne(() => Caja, (caja: Caja) => caja.movimientos, { nullable: false })
  @JoinColumn({ name: 'caja_id' })
  caja: Caja;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
