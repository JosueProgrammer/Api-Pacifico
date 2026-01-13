import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto, UpdateProductoDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { Producto } from '../common/entities/producto.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateStockDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @IsEnum(['incrementar', 'decrementar'], { message: 'El tipo debe ser "incrementar" o "decrementar"' })
  tipo: 'incrementar' | 'decrementar';
}

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Crear un nuevo producto',
    description: 'Crea un nuevo producto en el sistema. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiResponseWithData(
    Producto,
    'Producto creado exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createProductoDto: CreateProductoDto) {
    const producto = await this.productosService.create(createProductoDto);
    return ApiResponseDto.Success(
      producto,
      'Crear Producto',
      'Producto creado exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los productos',
    description: 'Obtiene una lista paginada de productos con opciones de filtrado y ordenamiento.',
  })
  @ApiResponseWithPagination(
    Producto,
    'Lista de productos obtenida exitosamente',
    HttpStatus.OK,
  )
  async findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['nombre', 'codigoBarras', 'activo', 'categoriaId']) filter?: FilteringParam<Producto> | null,
    @SortingParamDecorator(['nombre', 'precioVenta', 'stock', 'fechaCreacion']) sorting?: SortingParam<Producto> | null,
  ) {
    return await this.productosService.findAll(pagination, filter, sorting);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un producto por ID',
    description: 'Obtiene los detalles de un producto específico incluyendo su categoría asociada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Producto,
    'Producto obtenido exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const producto = await this.productosService.findOne(id);
    return ApiResponseDto.Success(
      producto,
      'Obtener Producto',
      'Producto obtenido exitosamente',
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Actualizar un producto',
    description: 'Actualiza los datos de un producto existente. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Producto,
    'Producto actualizado exitosamente',
    HttpStatus.OK,
  )
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    const producto = await this.productosService.update(id, updateProductoDto);
    return ApiResponseDto.Success(
      producto,
      'Actualizar Producto',
      'Producto actualizado exitosamente',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar un producto',
    description: 'Elimina un producto del sistema. Solo se puede eliminar si no tiene ventas asociadas. Requiere permisos de Administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Object,
    'Producto eliminado exitosamente',
    HttpStatus.OK,
  )
  async remove(@Param('id') id: string) {
    await this.productosService.remove(id);
    return ApiResponseDto.Success(
      null,
      'Eliminar Producto',
      'Producto eliminado exitosamente',
    );
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Activar un producto',
    description: 'Activa un producto que estaba desactivado. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Producto,
    'Producto activado exitosamente',
    HttpStatus.OK,
  )
  async activate(@Param('id') id: string) {
    const producto = await this.productosService.activate(id);
    return ApiResponseDto.Success(
      producto,
      'Activar Producto',
      'Producto activado exitosamente',
    );
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Desactivar un producto',
    description: 'Desactiva un producto sin eliminarlo. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Producto,
    'Producto desactivado exitosamente',
    HttpStatus.OK,
  )
  async deactivate(@Param('id') id: string) {
    const producto = await this.productosService.deactivate(id);
    return ApiResponseDto.Success(
      producto,
      'Desactivar Producto',
      'Producto desactivado exitosamente',
    );
  }

  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Actualizar stock de un producto',
    description: 'Incrementa o decrementa el stock de un producto. Requiere permisos de Administrador, Supervisor o Vendedor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Producto,
    'Stock actualizado exitosamente',
    HttpStatus.OK,
  )
  async updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    const producto = await this.productosService.updateStock(
      id,
      updateStockDto.cantidad,
      updateStockDto.tipo,
    );
    return ApiResponseDto.Success(
      producto,
      'Actualizar Stock',
      'Stock actualizado exitosamente',
    );
  }
}

