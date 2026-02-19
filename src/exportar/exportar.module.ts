import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportarController } from './exportar.controller';
import { PdfService } from './services/pdf.service';
import { ExcelService } from './services/excel.service';
import { Venta } from '../common/entities/venta.entity';
import { Compra } from '../common/entities/compra.entity';
import { Producto } from '../common/entities/producto.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      Compra,
      Producto,
    ]),
    AuthModule, // For Auth guards
  ],
  controllers: [ExportarController],
  providers: [PdfService, ExcelService],
})
export class ExportarModule {}
