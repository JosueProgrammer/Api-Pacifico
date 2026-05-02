import { PartialType } from '@nestjs/swagger';
import { CreateReparacionDto } from './create-reparacion.dto';

export class UpdateReparacionDto extends PartialType(CreateReparacionDto) {}
