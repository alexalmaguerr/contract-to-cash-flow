import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MedidoresController } from './medidores.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MedidoresController],
})
export class MedidoresModule {}
