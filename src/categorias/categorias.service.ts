import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../common/entities/categoria.entity';
import { CreateCategoriaDto, UpdateCategoriaDto, QueryCategoriaDto, CategoriaResponseDto } from './dtos';
import { plainToInstance } from 'class-transformer';
import {
    getWhereConditions,
    getSortingOrder,
    handleDBErrors,
    FilteringParam,
    SortingParam,
} from '../common/helpers/typeorm-helpers';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';
import { ApiPaginatedMetaDto } from '../common/dto/api-paginated-meta.dto';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';
import { PaginationParamsDto } from '../common/dto/pagination-param.dto';

@Injectable()
export class CategoriasService {
    constructor(
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,
    ) { }

    private async findEntityById(id: string): Promise<Categoria> {
        const categoria = await this.categoriaRepository.findOne({
            where: { id },
            relations: ['productos'],
        });

        if (!categoria) {
            throw new NotFoundException(
                `Categoría con ID "${id}" no encontrada`,
                ERROR_TITLES.NOT_FOUND_ERROR,
            );
        }

        return categoria;
    }


    async create(createCategoriaDto: CreateCategoriaDto): Promise<CategoriaResponseDto> {
        try {
            // Verificar si ya existe una categoría con el mismo nombre
            const categoriaExistente = await this.categoriaRepository.findOne({
                where: { nombre: createCategoriaDto.nombre },
            });

            if (categoriaExistente) {
                throw new BadRequestException(
                    `Ya existe una categoría con el nombre "${createCategoriaDto.nombre}"`,
                    ERROR_TITLES.CONFLICT_ERROR,
                );
            }

            const categoria = this.categoriaRepository.create({
                ...createCategoriaDto,
                activo: createCategoriaDto.activo ?? true,
            });

            const savedCategoria = await this.categoriaRepository.save(categoria);
            return plainToInstance(CategoriaResponseDto, savedCategoria);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.CATEGORIA_NOT_CREATED);
            throw error;
        }
    }

    async findAll(
        pagination: PaginationParamsDto,
        filter?: FilteringParam<Categoria> | null,
        sorting?: SortingParam<Categoria> | null,
    ): Promise<ApiPaginatedResponseDto<CategoriaResponseDto>> {
        try {
            const { page, limit } = pagination;
            const skip = (page - 1) * limit;

            // Construir condiciones de filtrado
            const whereConditions = getWhereConditions(filter ?? null);

            // Aplicar ordenamiento
            const order = {
                nombre: 'ASC' as const,
                ...getSortingOrder(sorting ?? null),
            };

            // Obtener total
            const total = await this.categoriaRepository.count({
                where: whereConditions,
            });

            // Obtener registros paginados
            const categorias = await this.categoriaRepository.find({
                where: whereConditions,
                order,
                skip,
                take: limit,
            });

            const data = plainToInstance(CategoriaResponseDto, categorias);

            const meta: ApiPaginatedMetaDto = {
                currentPage: page,
                itemsPerPage: limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            };

            return ApiPaginatedResponseDto.Success(
                data,
                meta,
                'Categorías obtenidas exitosamente',
                'Lista de categorías',
            );
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.CATEGORIAS_NOT_FOUND);
            throw error;
        }
    }

    async findOne(id: string): Promise<CategoriaResponseDto> {
        try {
            const categoria = await this.findEntityById(id);
            return plainToInstance(CategoriaResponseDto, categoria);
        } catch (error) {
            handleDBErrors(error, `Categoría con ID "${id}" no encontrada`);
            throw error;
        }
    }

    async update(id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<CategoriaResponseDto> {
        try {
            const categoria = await this.findEntityById(id);

            // Si se está actualizando el nombre, verificar que no exista otra categoría con el mismo nombre
            if (updateCategoriaDto.nombre && updateCategoriaDto.nombre !== categoria.nombre) {
                const categoriaExistente = await this.categoriaRepository.findOne({
                    where: { nombre: updateCategoriaDto.nombre },
                });

                if (categoriaExistente) {
                    throw new BadRequestException(
                        `Ya existe una categoría con el nombre "${updateCategoriaDto.nombre}"`,
                        ERROR_TITLES.CONFLICT_ERROR,
                    );
                }
            }

            // Actualizar la categoría
            Object.assign(categoria, updateCategoriaDto);
            const updatedCategoria = await this.categoriaRepository.save(categoria);
            return plainToInstance(CategoriaResponseDto, updatedCategoria);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.CATEGORIA_NOT_UPDATED);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const categoria = await this.findEntityById(id);

            // Verificar si la categoría tiene productos asociados
            if (categoria.productos && categoria.productos.length > 0) {
                throw new BadRequestException(
                    `No se puede eliminar la categoría porque tiene ${categoria.productos.length} producto(s) asociado(s)`,
                    ERROR_TITLES.CONFLICT_ERROR,
                );
            }

            await this.categoriaRepository.remove(categoria);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.CATEGORIA_NOT_DELETED);
            throw error;
        }
    }

    async activate(id: string): Promise<CategoriaResponseDto> {
        try {
            const categoria = await this.findEntityById(id);
            categoria.activo = true;
            const updated = await this.categoriaRepository.save(categoria);
            return plainToInstance(CategoriaResponseDto, updated);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.CATEGORIA_NOT_UPDATED);
            throw error;
        }
    }

    async deactivate(id: string): Promise<CategoriaResponseDto> {
        try {
            const categoria = await this.findEntityById(id);
            categoria.activo = false;
            const updated = await this.categoriaRepository.save(categoria);
            return plainToInstance(CategoriaResponseDto, updated);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.CATEGORIA_NOT_UPDATED);
            throw error;
        }
    }
}

