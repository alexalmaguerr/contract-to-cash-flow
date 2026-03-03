import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SigeHydraController } from './sige-hydra.controller';
import { SigeHydraService } from './sige-hydra.service';

@Module({
  imports: [AuthModule],
  controllers: [SigeHydraController],
  providers: [SigeHydraService],
})
export class SigeHydraModule {}
