import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reparacion } from '../common/entities/reparacion.entity';
import { CreateReparacionDto } from './dto/create-reparacion.dto';
import { UpdateReparacionDto } from './dto/update-reparacion.dto';

@Injectable()
export class ReparacionesService {
  constructor(
    @InjectRepository(Reparacion)
    private readonly reparacionRepository: Repository<Reparacion>,
  ) {}

  async create(createReparacionDto: CreateReparacionDto): Promise<Reparacion> {
    const reparacion = this.reparacionRepository.create(createReparacionDto);
    return await this.reparacionRepository.save(reparacion);
  }

  async findAll(): Promise<Reparacion[]> {
    return await this.reparacionRepository.find({
      relations: ['cliente'],
      order: { fechaIngreso: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Reparacion> {
    const reparacion = await this.reparacionRepository.findOne({
      where: { id },
      relations: ['cliente']
    });
    if (!reparacion) {
      throw new NotFoundException(`Reparación con ID ${id} no encontrada`);
    }
    return reparacion;
  }

  async update(id: string, updateReparacionDto: UpdateReparacionDto): Promise<Reparacion> {
    const reparacion = await this.findOne(id);
    
    // Si marcamos como entregado, grabar fecha de entrega
    if (updateReparacionDto.estado === 'ENTREGADO' && reparacion.estado !== 'ENTREGADO') {
      reparacion.fechaEntrega = new Date();
    }
    
    Object.assign(reparacion, updateReparacionDto);
    reparacion.fechaActualizacion = new Date();
    
    return await this.reparacionRepository.save(reparacion);
  }

  async remove(id: string): Promise<void> {
    const reparacion = await this.findOne(id);
    await this.reparacionRepository.remove(reparacion);
  }
}
