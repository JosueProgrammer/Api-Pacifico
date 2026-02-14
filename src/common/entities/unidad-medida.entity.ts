import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from './producto.entity';

export enum TipoUnidad {
  UNIDAD = 'unidad',
  PESO = 'peso',
  VOLUMEN = 'volumen',
  LONGITUD = 'longitud',
}

@Entity({ name: 'unidades_medida' })
export class UnidadMedida {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  nombre: string;

  @Column({ nullable: false, length: 10 })
  abreviatura: string;

  @Column({ type: 'varchar', length: 20, default: TipoUnidad.UNIDAD })
  tipo: TipoUnidad;

  @Column({ name: 'activo', default: true })
  activo: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @OneToMany(() => Producto, (producto: Producto) => producto.unidadMedida)
  productos: Producto[];
}
