import { PartialType } from '@nestjs/swagger';
import { CreateReparacioneDto } from './create-reparacione.dto';

export class UpdateReparacioneDto extends PartialType(CreateReparacioneDto) {}
