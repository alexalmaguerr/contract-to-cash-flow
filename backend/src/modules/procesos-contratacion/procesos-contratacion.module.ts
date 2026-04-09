import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProcesosContratacionController } from './procesos-contratacion.controller';
import { ProcesosContratacionService } from './procesos-contratacion.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProcesosContratacionController],
  providers: [ProcesosContratacionService],
  exports: [ProcesosContratacionService],
})
export class ProcesosContratacionModule {}
