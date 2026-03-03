import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SigeHydraService } from './sige-hydra.service';
import { ApiTokenGuard } from '../auth/api-token.guard';

@Controller('sige-hydra')
@UseGuards(ApiTokenGuard)
export class SigeHydraController {
  constructor(private readonly sigeHydraService: SigeHydraService) {}

  @Get()
  findAll(
    @Query('cnttnum') cnttnum?: string,
    @Query('cnttrefant') cnttrefant?: string,
    @Query('contratoId') contratoId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.sigeHydraService.findAll({
      cnttnum,
      cnttrefant,
      contratoId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}
