import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Venta } from './venta.entity';

@Entity({ name: 'clientes' })
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  nombre: string;

  @Column({ nullable: true })
  correo: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ name: 'activo', default: true })
  activo: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaActualizacion: Date;

  @OneToMany(() => Venta, (venta: Venta) => venta.cliente)
  ventas: Venta[];
}

