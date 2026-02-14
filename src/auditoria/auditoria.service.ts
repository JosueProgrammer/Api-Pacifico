import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../common/entities/audit-log.entity';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';
import { ApiPaginatedMetaDto } from '../common/dto/api-paginated-meta.dto';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, filters: any = {}) {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    queryBuilder
      .leftJoinAndSelect('audit.usuario', 'usuario')
      .select([
        'audit',
        'usuario.id',
        'usuario.nombre',
        'usuario.email',
      ]);

    if (filters.entityName) {
      queryBuilder.andWhere('audit.entityName = :entityName', { entityName: filters.entityName });
    }

    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.fechaInicio) {
      queryBuilder.andWhere('audit.createdAt >= :fechaInicio', { fechaInicio: filters.fechaInicio });
    }

    if (filters.fechaFin) {
      queryBuilder.andWhere('audit.createdAt <= :fechaFin', { fechaFin: filters.fechaFin });
    }

    queryBuilder.orderBy('audit.createdAt', 'DESC');

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta: ApiPaginatedMetaDto = {
      totalItems: total,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };

    return ApiPaginatedResponseDto.Success(items, meta, 'Audit logs retrieved successfully');
  }
}
