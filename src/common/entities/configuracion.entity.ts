import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'configuracion' })
export class Configuracion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  clave: string;

  @Column({ type: 'text', nullable: true })
  valor: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo: string; // string, number, boolean, json

  @Column({ nullable: true })
  descripcion: string;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}

