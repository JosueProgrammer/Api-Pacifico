import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_name', nullable: false })
  entityName: string;

  @Column({ name: 'entity_id', nullable: false })
  entityId: string;

  @Column({ nullable: false })
  action: string; // create, update, delete

  @Column({ type: 'jsonb', nullable: true })
  changes: any;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;
}
