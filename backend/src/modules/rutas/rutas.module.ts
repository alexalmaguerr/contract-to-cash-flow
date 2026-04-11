import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RutasController } from './rutas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RutasController],
})
export class RutasModule {}
