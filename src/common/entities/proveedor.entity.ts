import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Compra } from './compra.entity';

@Entity({ name: 'proveedores' })
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  nombre: string;

  @Column({ nullable: true })
  correo: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ nullable: true })
  contacto: string;

  @Column({ name: 'activo', default: true })
  activo: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaActualizacion: Date;

  @OneToMany(() => Compra, (compra: Compra) => compra.proveedor)
  compras: Compra[];
}

