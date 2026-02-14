import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { RequestContext } from '../utils/request.context';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  /**
   * Called after entity insertion.
   */
  async afterInsert(event: InsertEvent<any>) {
    await this.logChange('create', event.entity, event.metadata, null);
  }

  /**
   * Called after entity update.
   */
  async afterUpdate(event: UpdateEvent<any>) {
    await this.logChange('update', event.entity, event.metadata, event.databaseEntity);
  }

  /**
   * Called after entity removal.
   */
  async afterRemove(event: RemoveEvent<any>) {
    await this.logChange('delete', event.databaseEntity, event.metadata, null);
  }

  private async logChange(action: string, entity: any, metadata: any, oldEntity: any) {
    // Evitar auditar la propia tabla de logs o entidades irrelevantes
    if (metadata.name === 'AuditLog' || metadata.tableName === 'audit_logs') {
      return;
    }

    try {
      const context = RequestContext.getCurrentContext();
      const user = context?.user;
      const userId = user?.id;

      // Obtener ID de la entidad
      let entityId = entity?.id;
      if (!entityId && oldEntity?.id) {
          entityId = oldEntity.id;
      }
      
      // Si no hay ID, intentamos obtenerlo de las columnas primarias
      if (!entityId && metadata.primaryColumns.length > 0) {
          const primaryColumn = metadata.primaryColumns[0].propertyName;
          entityId = entity?.[primaryColumn] || oldEntity?.[primaryColumn];
      }

      // Calcular cambios
      let changes: any = {};
      if (action === 'update' && oldEntity && entity) {
        changes = this.getDiff(oldEntity, entity);
        // Si no hay cambios reales, no guardamos
        if (Object.keys(changes).length === 0) return;
      } else if (action === 'create') {
        const { ...data } = entity;
        // Ocultar password si existe
        if (data.password) delete data.password;
        changes = data;
      } else if (action === 'delete') {
         const { ...data } = oldEntity || entity;
          if (data && data.password) delete data.password;
          changes = data;
      }

      const auditLog = new AuditLog();
      auditLog.entityName = metadata.name; // Nombre de la clase entidad
      auditLog.entityId = String(entityId); 
      auditLog.action = action;
      auditLog.changes = changes;
      auditLog.userId = userId;
      auditLog.createdAt = new Date();

      // Guardar usando un nuevo query runner o repositorio específico para evitar interferir con la transacción actual si la hubiera
      // Usamos getRepository directamente pero cuidado con transacciones
      // Lo mejor es usar el manager del evento si quisiéramos ser parte de la transacción, 
      // pero para logs a veces es mejor que se guarden sí o sí, o al revés.
      // Aquí usaremos una operación separada por simplicidad.
      
      await this.dataSource.getRepository(AuditLog).save(auditLog);

    } catch (error) {
      console.error('Error saving audit log:', error);
      // No re-lanzamos el error para no afectar la operación principal
    }
  }

  private getDiff(oldEntity: any, newEntity: any) {
    const diff: any = {};
    for (const key in newEntity) {
      if (key === 'fechaActualizacion' || key === 'fechaCreacion') continue;
      
      if (
        newEntity.hasOwnProperty(key) && 
        oldEntity.hasOwnProperty(key) &&
        newEntity[key] !== oldEntity[key]
      ) {
         // Filtrar password
         if (key === 'password') continue;
         
         // Comparar objetos complejos (fechas, etc)
         if (newEntity[key] instanceof Date && oldEntity[key] instanceof Date) {
             if (newEntity[key].getTime() === oldEntity[key].getTime()) continue;
         }
         
        diff[key] = {
          old: oldEntity[key],
          new: newEntity[key],
        };
      }
    }
    return diff;
  }
}
